import type { AgentMessage, AgentResponse } from "./types";
import { trackWallet } from "./skills/wallet-tracker";
import { getTokenInfo, searchTokens } from "./skills/token-info";
import { auditToken } from "./skills/token-audit";
import { getSignals, getSignalForToken } from "./skills/trading-signal";
import { getMarketRank } from "./skills/market-rank";
import { getMemeRush } from "./skills/meme-rush";
import { callLLM } from "./llm";

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
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/signals`);
          if (res.ok) {
            const data = await res.json();
            const r = data.regime;
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
              `**Leading Narrative:** ${data.narrative.leader.toUpperCase()}\n\n` +
              `_${r.rationale.join(" | ")}_`;
          } else {
            response = "Could not fetch regime data. Please try again.";
          }
        } catch {
          response = "Signal service unavailable. Please try again later.";
        }
        break;
      }

      case "news": {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/news`);
          if (res.ok) {
            const data = await res.json();
            const tone = data.overallSentiment > 0.15 ? "Bullish 🟢" : data.overallSentiment < -0.15 ? "Bearish 🔴" : "Mixed 🟡";
            invocations.push({ name: "news-feed", input: "latest", output: `${data.items.length} items` });
            response = `**📰 Crypto News Feed**\n\n` +
              `**Overall Sentiment:** ${tone} (${data.overallSentiment >= 0 ? "+" : ""}${data.overallSentiment.toFixed(2)})\n\n` +
              data.items.slice(0, 10).map((item: { sentiment: number; title: string; matchedSymbols: string[] }) => {
                const dot = item.sentiment > 0.15 ? "🟢" : item.sentiment < -0.15 ? "🔴" : "🟡";
                const syms = item.matchedSymbols.slice(0, 2).map((s: string) => `**${s}**`).join(", ");
                return `${dot} ${item.title}${syms ? ` [${syms}]` : ""}`;
              }).join("\n");
          } else {
            response = "Could not fetch news. Please try again.";
          }
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
          response = `I'm **CryptoSentry**, your AI crypto intelligence agent powered by Binance Skills Hub.\n\n` +
            `Here's what I can help with:\n\n` +
            `🔍 **Token Info** — "What is SOL?" or "Price of ETH"\n` +
            `🛡️ **Security Audit** — "Audit PEPE" or "Is WIF safe?"\n` +
            `📈 **Trading Signals** — "Trading signals" or "Should I buy BTC?"\n` +
            `🐋 **Wallet Tracking** — "Track wallet 0x..."\n` +
            `🔥 **Meme Rush** — "What's trending?" or "Show me meme tokens"\n` +
            `📊 **Market Rankings** — "Market overview" or "Top coins"\n` +
            `🧭 **Market Regime** — "What's the market regime?" or "Risk-on or risk-off?"\n` +
            `📰 **News Feed** — "Latest crypto news" or "What's the sentiment?"\n` +
            `🔬 **Full Analysis** — "Analyze SOL" for a complete breakdown\n\n` +
            `Just ask me anything about crypto!`;
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
