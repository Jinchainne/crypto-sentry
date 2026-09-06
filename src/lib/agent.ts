import type { AgentMessage, AgentResponse } from "./types";
import { trackWallet } from "./skills/wallet-tracker";
import { getTokenInfo, searchTokens } from "./skills/token-info";
import { auditToken } from "./skills/token-audit";
import { getSignals, getSignalForToken } from "./skills/trading-signal";
import { getMarketRank } from "./skills/market-rank";
import { getMemeRush } from "./skills/meme-rush";
import { callLLM } from "./llm";
import { getPortfolio, getAllocation } from "./portfolio/store";
import { getRiskMetrics, runRiskChecks } from "./risk";
import { previewTrade } from "./execution/preview";
import { routeOrder } from "./execution/router";
import { addPosition, updateCash } from "./portfolio/store";
import type { TradeRequest } from "./execution/router";

interface SkillInvocation {
  name: string;
  input: string;
  output: string;
}

function detectIntent(message: string): { intent: string; entities: string[] } {
  const lower = message.toLowerCase();
  const entities: string[] = [];

  // Extract token symbols (3-5 uppercase letters or common names)
  const symbolMatch = message.match(/\b[A-Z]{2,5}\b/g);
  if (symbolMatch) entities.push(...symbolMatch);

  // Extract wallet addresses
  const addrMatch = message.match(/0x[a-fA-F0-9]{40}/g);
  if (addrMatch) entities.push(...addrMatch);

  // Detect intent
  if (lower.includes("portfolio") || lower.includes("holdings") || lower.includes("positions") || lower.includes("pnl") || lower.includes("balance")) {
    return { intent: "portfolio", entities };
  }
  if ((lower.includes("buy") || lower.includes("sell") || lower.includes("execute") || lower.includes("trade")) && (lower.includes("btc") || lower.includes("eth") || lower.includes("sol") || lower.includes("bnb") || lower.match(/\d/))) {
    return { intent: "execute", entities };
  }
  if (lower.includes("risk") || lower.includes("risk check") || lower.includes("risk metric")) {
    return { intent: "risk", entities };
  }
  if (lower.includes("alert") || lower.includes("monitor") || lower.includes("watch")) {
    return { intent: "alert", entities };
  }
  if (lower.includes("wallet") || lower.includes("track") || lower.includes("address")) {
    return { intent: "wallet-track", entities };
  }
  if (lower.includes("audit") || lower.includes("safe") || lower.includes("rug") || lower.includes("scam")) {
    return { intent: "token-audit", entities };
  }
  if (lower.includes("regime") || lower.includes("risk-on") || lower.includes("risk-off") || lower.includes("market regime")) {
    return { intent: "regime", entities };
  }
  if (lower.includes("news") || lower.includes("headlines") || lower.includes("sentiment")) {
    return { intent: "news", entities };
  }
  if (lower.includes("signal") || lower.includes("trade") || lower.includes("buy") || lower.includes("sell")) {
    return { intent: "trading-signal", entities };
  }
  if (lower.includes("meme") || lower.includes("trending") || lower.includes("viral")) {
    return { intent: "meme-rush", entities };
  }
  if (lower.includes("market") || lower.includes("rank") || lower.includes("top")) {
    return { intent: "market-rank", entities };
  }
  if (lower.includes("price") || lower.includes("info") || lower.includes("about") || lower.includes("what is")) {
    return { intent: "token-info", entities };
  }
  if (lower.includes("analyze") || lower.includes("analysis") || lower.includes("overview")) {
    return { intent: "full-analysis", entities };
  }

  return { intent: "general", entities };
}

export async function processAgentMessage(
  messages: AgentMessage[]
): Promise<AgentResponse> {
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== "user") {
    return {
      message: "I didn't understand that. Try asking about a token, wallet, or market trend.",
      skillsInvoked: [],
      confidence: 0,
    };
  }

  const { intent, entities } = detectIntent(lastMessage.content);
  const invocations: SkillInvocation[] = [];
  let response = "";

  try {
    switch (intent) {
      case "portfolio": {
        const portfolio = getPortfolio();
        const allocation = getAllocation();
        invocations.push({ name: "portfolio", input: "current", output: `${portfolio.positions.length} positions` });

        const pnlEmoji = portfolio.dailyPnl >= 0 ? "📈" : "📉";
        response = `**💼 Portfolio Overview** ${pnlEmoji}\n\n` +
          `**Mode:** ${portfolio.mode.toUpperCase()}\n` +
          `**Total Value:** $${portfolio.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n` +
          `**Cash:** $${portfolio.cash.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n` +
          `**Daily P&L:** ${portfolio.dailyPnl >= 0 ? "+" : ""}$${portfolio.dailyPnl.toFixed(2)}\n` +
          `**Realized P&L:** ${portfolio.realizedPnl >= 0 ? "+" : ""}$${portfolio.realizedPnl.toFixed(2)}\n\n`;

        if (portfolio.positions.length > 0) {
          response += `**Open Positions:**\n` +
            portfolio.positions.map((p) => {
              const pnlSign = p.unrealizedPnl >= 0 ? "+" : "";
              return `- **${p.symbol}** (${p.side}) — ${p.quantity.toFixed(4)} @ $${p.avgEntry.toLocaleString()} → $${p.currentPrice.toLocaleString()} | P&L: ${pnlSign}$${p.unrealizedPnl.toFixed(2)}`;
            }).join("\n") + "\n\n";
        }

        if (allocation.length > 0) {
          response += `**Allocation:**\n` +
            allocation.map((a) => `- ${a.symbol}: ${a.percent.toFixed(1)}% ($${a.value.toLocaleString()})`).join("\n");
        }

        if (portfolio.positions.length === 0) {
          response += `_No open positions. Try "buy BTC" to start trading._`;
        }
        break;
      }

      case "execute": {
        const symbol = entities.find((e) => !e.startsWith("0x") && e.length >= 2 && e.length <= 5);
        const side = lastMessage.content.toLowerCase().includes("sell") ? "sell" : "buy";
        const qtyMatch = lastMessage.content.match(/(\d+\.?\d*)\s*(BTC|ETH|SOL|BNB)/i);
        const qty = qtyMatch ? parseFloat(qtyMatch[1]) : 0.01;

        if (!symbol) {
          response = "Please specify a token to trade. Example: `Buy 0.1 BTC` or `Sell 1 ETH`";
          break;
        }

        try {
          // Get current price from token info
          const info = await getTokenInfo(symbol);
          const priceStr = info?.price?.replace(/[^0-9.]/g, "") || "0";
          const price = parseFloat(priceStr) || 65000;

          const tradeReq: TradeRequest = {
            symbol: symbol.toUpperCase(),
            side: side as "buy" | "sell",
            quantity: qty,
            price,
            mode: "paper",
          };

          const tradePreview = previewTrade(tradeReq);
          const riskCheck = runRiskChecks(tradeReq);

          invocations.push(
            { name: "execution-preview", input: `${side} ${qty} ${symbol}`, output: "preview" },
            { name: "risk-check", input: symbol, output: riskCheck.passed ? "passed" : "blocked" }
          );

          const riskEmoji = riskCheck.passed ? "✅" : "❌";
          response = `**⚡ Trade Preview: ${side.toUpperCase()} ${qty} ${symbol.toUpperCase()}**\n\n` +
            `**Mode:** PAPER (default)\n` +
            `**Est. Price:** $${tradePreview.estimatedPrice.toLocaleString()}\n` +
            `**Est. Cost:** $${tradePreview.estimatedCost.toLocaleString()}\n` +
            `**Fees:** $${tradePreview.fees.toFixed(2)}\n` +
            `**Slippage:** ${tradePreview.slippage}%\n\n` +
            `**Risk Checks:** ${riskEmoji}\n` +
            riskCheck.checks.map((c) => `- ${c.passed ? "✅" : "❌"} ${c.name}: ${c.detail}`).join("\n") + "\n\n";

          if (riskCheck.warnings.length > 0) {
            response += `**Warnings:**\n${riskCheck.warnings.map((w) => `- ⚠️ ${w}`).join("\n")}\n\n`;
          }

          if (riskCheck.passed) {
            // Auto-execute paper trade
            const finalReq = { ...tradeReq, quantity: riskCheck.adjustedQuantity || qty };
            const result = await routeOrder(finalReq);

            if (result.status === "filled") {
              const cost = result.quantity * result.avgPrice;
              updateCash(-cost - result.fees);
              addPosition({
                symbol: result.symbol,
                quantity: result.quantity,
                avgEntry: result.avgPrice,
                currentPrice: result.avgPrice,
                unrealizedPnl: 0,
                side: "long",
                openedAt: Date.now(),
              });

              response += `**✅ Trade Executed (Paper)**\n` +
                `Order ID: \`${result.orderId}\`\n` +
                `Filled: ${result.quantity} @ $${result.avgPrice.toLocaleString()}\n` +
                `Fees: $${result.fees.toFixed(2)}`;
            }
          } else {
            response += `_Trade blocked by risk management. Adjust your order._`;
          }
        } catch (err) {
          response = `Trade preview failed: ${err instanceof Error ? err.message : "Unknown error"}. Try specifying a price manually.`;
        }
        break;
      }

      case "risk": {
        const metrics = getRiskMetrics();
        invocations.push({ name: "risk-sentinel", input: "metrics", output: `score: ${metrics.riskScore}` });

        const scoreEmoji = metrics.riskScore < 30 ? "🟢" : metrics.riskScore < 60 ? "🟡" : "🔴";
        response = `**🛡️ Risk Dashboard** ${scoreEmoji}\n\n` +
          `**Risk Score:** ${metrics.riskScore}/100\n` +
          `**Total Value:** $${metrics.totalValue.toLocaleString()}\n` +
          `**Cash:** $${metrics.cash.toLocaleString()}\n` +
          `**Daily P&L:** ${metrics.dailyPnl >= 0 ? "+" : ""}$${metrics.dailyPnl.toFixed(2)} (${metrics.dailyLossPct.toFixed(2)}% loss)\n` +
          `**Positions:** ${metrics.positionCount}\n` +
          `**Max Concentration:** ${metrics.maxConcentration.toFixed(1)}%\n\n`;

        if (metrics.alerts.length > 0) {
          response += `**⚠️ Alerts:**\n${metrics.alerts.map((a) => `- ${a}`).join("\n")}`;
        } else {
          response += `_All risk parameters within normal range._`;
        }
        break;
      }

      case "alert": {
        response = `**🔔 Alert System**\n\n` +
          `Alert monitoring is active. Current capabilities:\n\n` +
          `- **Regime changes** — I'll notify you when market switches between risk-on/risk-off\n` +
          `- **Price alerts** — Set via "Alert me when BTC hits $X"\n` +
          `- **Risk alerts** — Automatic warnings when daily loss > 3%\n\n` +
          `_Alerts are delivered through the chat. Full push notifications coming soon._`;
        break;
      }

      case "wallet-track": {
        const addr = entities.find((e) => e.startsWith("0x"));
        if (addr) {
          const wallet = await trackWallet(addr);
          if (wallet) {
            invocations.push({
              name: "wallet-tracker",
              input: addr,
              output: `Found wallet with ${wallet.balance}`,
            });
            response = `**Wallet Analysis: ${wallet.label || "Unknown"}**\n\n` +
              `Address: \`${wallet.address}\`\n` +
              `Chain: ${wallet.chain}\n` +
              `Balance: ${wallet.balance}\n\n` +
              `**Token Holdings:**\n` +
              wallet.tokens.map((t) => `- ${t.symbol}: ${t.balance} (${t.value}) — ${t.change24h >= 0 ? "📈" : "📉"} ${t.change24h}%`).join("\n") +
              `\n\n_Last active: ${new Date(wallet.lastActive).toLocaleString()}_`;
          } else {
            response = "I couldn't find data for that wallet address. Make sure it's a valid Ethereum address.";
          }
        } else {
          response = "Please provide a wallet address (0x...) to track. Example: `Track wallet 0xd8da6bf26964af9d7eed9e03e53415d37aa96045`";
        }
        break;
      }

      case "token-audit": {
        const symbol = entities.find((e) => !e.startsWith("0x"));
        if (symbol) {
          const audit = await auditToken(symbol);
          if (audit) {
            invocations.push({
              name: "token-audit",
              input: symbol,
              output: `Score: ${audit.score}/100`,
            });
            const scoreEmoji = audit.score >= 80 ? "🟢" : audit.score >= 60 ? "🟡" : "🔴";
            response = `**Security Audit: ${audit.token}** ${scoreEmoji}\n\n` +
              `**Score: ${audit.score}/100**\n\n` +
              `**Checks:**\n` +
              `- Contract Verified: ${audit.contractVerified ? "✅" : "❌"}\n` +
              `- Honeypot: ${audit.honeypot ? "🚨 YES" : "✅ No"}\n` +
              `- Mintable: ${audit.mintable ? "⚠️ Yes" : "✅ No"}\n` +
              `- Proxy Contract: ${audit.proxyContract ? "⚠️ Yes" : "✅ No"}\n` +
              `- Liquidity Locked: ${audit.liquidityLocked ? "✅ Yes" : "❌ No"}\n\n` +
              `**Risks:**\n${audit.risks.map((r) => `- ⚠️ ${r}`).join("\n")}\n\n` +
              `**Positives:**\n${audit.positives.map((p) => `- ✅ ${p}`).join("\n")}`;
          }
        } else {
          response = "Please specify a token symbol to audit. Example: `Audit PEPE`";
        }
        break;
      }

      case "regime": {
        try {
          const { buildSignals } = await import("./signals");
          const { regime: r } = await buildSignals();
          const regimeEmoji = r.regime === "risk_on" ? "🟢" : r.regime === "risk_off" ? "🔴" : "🟡";
          invocations.push({ name: "signals", input: "regime", output: r.regime });
          response = `**Market Regime: ${r.regime === "risk_on" ? "Risk-On" : r.regime === "risk_off" ? "Risk-Off" : "Neutral"}** ${regimeEmoji}\n\n` +
            `**Composite Score:** ${r.score >= 0 ? "+" : ""}${r.score.toFixed(2)}\n` +
            `**Confidence:** ${Math.round(r.confidence * 100)}%\n` +
            `**Volatility:** ${r.vol}\n\n` +
            `**Signals:**\n` +
            `- Flows: ${r.signals.flow.score >= 0 ? "+" : ""}${r.signals.flow.score.toFixed(2)} (${r.signals.flow.trend})\n` +
            `- Sentiment: ${r.signals.sentiment.score >= 0 ? "+" : ""}${r.signals.sentiment.score.toFixed(2)} (${r.signals.sentiment.sampleSize} items)\n` +
            `- Volatility: ${r.signals.volatility.score >= 0 ? "+" : ""}${r.signals.volatility.score.toFixed(2)} (${r.signals.volatility.state})\n\n` +
            `**Rationale:**\n${r.rationale.map((reason: string) => `- ${reason}`).join("\n")}`;
        } catch {
          response = "Signal service unavailable. Please try again later.";
        }
        break;
      }

      case "news": {
        try {
          const { buildSignals } = await import("./signals");
          const { narrative } = await buildSignals();
          const topSectors = narrative.ranked.slice(0, 5);
          invocations.push({ name: "news-feed", input: "narrative", output: `${topSectors.length} sectors` });
          response = `**📰 Narrative & Sector Momentum**\n\n` +
            `**Leading Narrative:** ${narrative.leader.toUpperCase()} 🏆\n\n` +
            topSectors.map((s: { sector: string; momentum: number }, i: number) => {
              const emoji = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "  ";
              const sign = s.momentum >= 0 ? "+" : "";
              return `${emoji} **${s.sector}** — ${sign}${(s.momentum * 100).toFixed(1)}% momentum`;
            }).join("\n") +
            `\n\n_Sector momentum blends 7-day and 30-day SSI index returns. The index tilts toward the leader when risk-on._`;
        } catch {
          response = "News service unavailable. Please try again later.";
        }
        break;
      }

      case "trading-signal": {
        const symbol = entities.find((e) => !e.startsWith("0x"));
        if (symbol) {
          const signal = await getSignalForToken(symbol);
          if (signal) {
            invocations.push({
              name: "trading-signal",
              input: symbol,
              output: `${signal.direction} with ${signal.confidence}% confidence`,
            });
            const dirEmoji = signal.direction === "BUY" ? "🟢" : signal.direction === "SELL" ? "🔴" : "🟡";
            response = `**Trading Signal: ${signal.token}** ${dirEmoji}\n\n` +
              `**Direction:** ${signal.direction}\n` +
              `**Confidence:** ${signal.confidence}%\n` +
              `**Entry:** ${signal.price}\n` +
              `**Target:** ${signal.target}\n` +
              `**Stop Loss:** ${signal.stopLoss}\n\n` +
              `**Reasoning:** ${signal.reasoning}\n\n` +
              `_Source: ${signal.source}_`;
          } else {
            response = `No active signal for ${symbol}. Try checking the market overview for available signals.`;
          }
        } else {
          const signals = await getSignals();
          invocations.push({ name: "trading-signal", input: "all", output: `${signals.length} signals` });
          response = `**Active Trading Signals**\n\n` +
            signals.map((s) => {
              const dir = s.direction === "BUY" ? "🟢" : s.direction === "SELL" ? "🔴" : "🟡";
              return `${dir} **${s.token}** — ${s.direction} @ ${s.price} (${s.confidence}% confidence)\nTarget: ${s.target} | SL: ${s.stopLoss}`;
            }).join("\n\n");
        }
        break;
      }

      case "meme-rush": {
        const memes = await getMemeRush();
        invocations.push({ name: "meme-rush", input: "trending", output: `${memes.length} tokens` });
        response = `**🔥 Meme Token Rush — Trending Now**\n\n` +
          memes.map((m) => {
            const risk = m.risk === "LOW" ? "🟢" : m.risk === "MEDIUM" ? "🟡" : m.risk === "HIGH" ? "🟠" : "🔴";
            return `${risk} **${m.symbol}** (${m.name}) — ${m.price}\n` +
              `  1h: ${m.change1h >= 0 ? "+" : ""}${m.change1h}% | 24h: ${m.change24h >= 0 ? "+" : ""}${m.change24h}% | Vol: ${m.volume} | Risk: ${m.risk}`;
          }).join("\n\n");
        break;
      }

      case "market-rank": {
        const market = await getMarketRank();
        invocations.push({ name: "market-rank", input: "top", output: `${market.length} tokens` });
        response = `**📊 Market Rankings**\n\n` +
          market.map((m) =>
            `**#${m.rank} ${m.symbol}** — ${m.price} (${m.change24h >= 0 ? "+" : ""}${m.change24h}%)\n` +
            `  Vol: ${m.volume24h} | MCap: ${m.marketCap}`
          ).join("\n\n");
        break;
      }

      case "token-info": {
        const symbol = entities.find((e) => !e.startsWith("0x"));
        if (symbol) {
          const info = await getTokenInfo(symbol);
          if (info) {
            invocations.push({ name: "token-info", input: symbol, output: `Found ${info.name}` });
            response = `**${info.name} (${info.symbol})**\n\n` +
              `**Price:** ${info.price}\n` +
              `**24h Change:** ${info.change24h >= 0 ? "+" : ""}${info.change24h}%\n` +
              `**7d Change:** ${info.change7d >= 0 ? "+" : ""}${info.change7d}%\n` +
              `**Market Cap:** ${info.marketCap}\n` +
              `**24h Volume:** ${info.volume24h}\n` +
              `**Holders:** ${info.holders.toLocaleString()}\n` +
              `**Chain:** ${info.chain}` +
              (info.auditScore ? `\n**Audit Score:** ${info.auditScore}/100` : "");
          } else {
            const results = await searchTokens(symbol);
            if (results.length > 0) {
              response = `Couldn't find "${symbol}" exactly. Did you mean:\n\n` +
                results.map((t) => `- **${t.symbol}** (${t.name}) — ${t.price}`).join("\n");
            } else {
              response = `No data found for "${symbol}". Try a major token like BTC, ETH, SOL, or BNB.`;
            }
          }
        } else {
          response = "Please specify a token. Example: `What is ETH?` or `Price of SOL`";
        }
        break;
      }

      case "full-analysis": {
        const symbol = entities.find((e) => !e.startsWith("0x")) || "ETH";
        const [info, audit, signal] = await Promise.all([
          getTokenInfo(symbol),
          auditToken(symbol),
          getSignalForToken(symbol),
        ]);
        invocations.push(
          { name: "token-info", input: symbol, output: "loaded" },
          { name: "token-audit", input: symbol, output: "loaded" },
          { name: "trading-signal", input: symbol, output: "loaded" }
        );
        response = `**Full Analysis: ${symbol.toUpperCase()}**\n\n`;
        if (info) {
          response += `**Price:** ${info.price} (${info.change24h >= 0 ? "+" : ""}${info.change24h}% 24h)\n` +
            `**Market Cap:** ${info.marketCap} | **Volume:** ${info.volume24h}\n\n`;
        }
        if (audit) {
          response += `**Security Score:** ${audit.score}/100\n` +
            `Risks: ${audit.risks.length} | Positives: ${audit.positives.length}\n\n`;
        }
        if (signal) {
          response += `**Signal:** ${signal.direction} @ ${signal.price} (${signal.confidence}% confidence)\n` +
            `Target: ${signal.target} | SL: ${signal.stopLoss}\n\n` +
            `_${signal.reasoning}_`;
        }
        break;
      }

      default: {
        // Try LLM for general questions
        try {
          const llmResponse = await callLLM(lastMessage.content);
          invocations.push({ name: "llm", input: lastMessage.content, output: "AI response" });
          response = llmResponse;
        } catch {
          // Fallback if LLM not configured
          response = `I'm **CryptoSentry**, your autonomous crypto intelligence agent.\n\n` +
              `Here's what I can do:\n\n` +
              `💼 **Portfolio** — "Show my portfolio" or "What are my positions?"\n` +
              `⚡ **Execute Trades** — "Buy 0.01 BTC" or "Sell 1 ETH" (paper mode)\n` +
              `🛡️ **Risk Check** — "Show risk metrics" or "Run risk check"\n` +
              `🔔 **Alerts** — "Set up alerts" or "Monitor BTC"\n` +
              `🔍 **Token Info** — "What is SOL?" or "Price of ETH"\n` +
              `🛡️ **Security Audit** — "Audit PEPE" or "Is WIF safe?"\n` +
              `📈 **Trading Signals** — "Trading signals" or "What's the signal?"\n` +
              `🐋 **Wallet Tracking** — "Track wallet 0x..."\n` +
              `🔥 **Meme Rush** — "What's trending?" or "Show me meme tokens"\n` +
              `📊 **Market Rankings** — "Market overview" or "Top coins"\n` +
              `🧭 **Market Regime** — "What's the market regime?"\n` +
              `📰 **Narrative** — "Latest crypto news" or "Sector momentum"\n` +
              `🔬 **Full Analysis** — "Analyze SOL" for a complete breakdown\n\n` +
              `_Default mode: Paper trading (no real money). All trades pass risk checks._`;
        }
      }
    }
  } catch (error) {
    response = `An error occurred while processing your request: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`;
  }

  return {
    message: response,
    skillsInvoked: invocations.map((i) => i.name),
    confidence: invocations.length > 0 ? 0.85 : 0.5,
  };
}
