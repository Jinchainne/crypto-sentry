"use client";

import { useEffect, useState } from "react";
import type { MarketRankItem, TradingSignal, MemeToken } from "@/lib/types";
import { formatPercent, timeAgo } from "@/lib/utils";

function getRiskClass(risk: string): string {
  switch (risk) {
    case "LOW": return "risk-low";
    case "MEDIUM": return "risk-medium";
    case "HIGH": return "risk-high";
    case "EXTREME": return "risk-extreme";
    default: return "risk-medium";
  }
}

export default function DashboardPage() {
  const [market, setMarket] = useState<MarketRankItem[]>([]);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [memes, setMemes] = useState<MemeToken[]>([]);

  useEffect(() => {
    import("@/lib/skills/market-rank").then(m => m.getMarketRank().then(setMarket));
    import("@/lib/skills/trading-signal").then(m => m.getSignals().then(setSignals));
    import("@/lib/skills/meme-rush").then(m => m.getMemeRush().then(setMemes));
  }, []);

  return (
    <main className="max-w-[1400px] mx-auto px-4 pb-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A8A09A]">Home</span>
          <div className="live-dot" />
          <span className="text-[10px] font-semibold text-[#E8610A]">LIVE</span>
        </div>
        <h1 className="text-2xl font-bold text-[#F5F0E8]">
          Start here — <span className="orange-gradient-text">then trade</span>
        </h1>
        <p className="text-[#A8A09A] text-sm mt-1">Run the agent, pick a signal, execute. Deeper tools live under each section.</p>
      </div>

      {/* KPI Cards — Bloom-AI style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Signals", value: signals.length.toString(), sub: "Across 4 tokens", positive: true, icon: "📈" },
          { label: "Tokens Tracked", value: market.length.toString(), sub: "Live market data", positive: true, icon: "🪙" },
          { label: "Meme Tokens", value: memes.length.toString(), sub: "Trending now", positive: true, icon: "🔥" },
          { label: "Skills Active", value: "6", sub: "Binance Skills Hub", positive: true, icon: "🤖" },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-card p-5">
            <div className="flex items-start justify-between mb-2">
              <p className="text-[10px] text-[#A8A09A] uppercase tracking-wider font-medium">{kpi.label}</p>
              <div className="icon-box">
                <span className="text-xs">{kpi.icon}</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#F5F0E8]">{kpi.value}</p>
            {kpi.sub && (
              <p className={`text-xs mt-1 font-medium ${kpi.positive ? "text-emerald-400" : "text-red-400"}`}>
                {kpi.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Market Rankings */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="icon-box">
              <span className="text-xs">📊</span>
            </div>
            <h2 className="text-sm font-bold text-[#F5F0E8]">Market Rankings</h2>
          </div>
          <span className="pill-badge text-[10px]">{market.length} tokens</span>
        </div>
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-[#A8A09A] border-b border-white/[0.06]">
                <th className="pb-2 pt-3 px-4 text-left font-semibold uppercase tracking-wider">#</th>
                <th className="pb-2 pt-3 px-4 text-left font-semibold uppercase tracking-wider">Asset</th>
                <th className="pb-2 pt-3 px-4 text-right font-semibold uppercase tracking-wider">Price</th>
                <th className="pb-2 pt-3 px-4 text-right font-semibold uppercase tracking-wider">24h</th>
                <th className="pb-2 pt-3 px-4 text-right font-semibold uppercase tracking-wider hidden md:table-cell">Volume</th>
                <th className="pb-2 pt-3 px-4 text-right font-semibold uppercase tracking-wider hidden md:table-cell">Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {market.map((item) => (
                <tr key={item.symbol} className="border-b border-white/[0.03]">
                  <td className="py-3 px-4 text-[#A8A09A] font-mono text-xs">{item.rank}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#F5F0E8]">{item.symbol}</span>
                    <span className="text-[#A8A09A] ml-2 text-xs">{item.name}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#F5F0E8]">{item.price}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${item.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {item.change24h >= 0 ? "+" : ""}{item.change24h.toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-right text-[#A8A09A] hidden md:table-cell">{item.volume24h}</td>
                  <td className="py-3 px-4 text-right text-[#A8A09A] hidden md:table-cell">{item.marketCap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Signals */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="icon-box">
              <span className="text-xs">📈</span>
            </div>
            <h2 className="text-sm font-bold text-[#F5F0E8]">Latest Signals</h2>
          </div>
          <span className="pill-badge-orange text-[10px]">{signals.length} active</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {signals.map((sig) => (
            <div key={sig.id} className={`glass-card-hover p-5 ${sig.direction === "BUY" ? "signal-buy" : sig.direction === "SELL" ? "signal-sell" : "signal-hold"}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-[#0E0804]" style={{ background: "linear-gradient(135deg, #E8610A, #F5A020)" }}>
                    {sig.token.slice(0, 2)}
                  </div>
                  <div>
                    <span className="font-bold text-lg text-[#F5F0E8]">{sig.token}</span>
                    <span className={`ml-2 text-xs px-2.5 py-1 rounded-full font-bold ${sig.direction === "BUY" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : sig.direction === "SELL" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-[rgba(245,160,32,0.2)] text-[#F5A020] border border-[rgba(245,160,32,0.3)]"}`}>
                      {sig.direction}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-[#A8A09A]">{timeAgo(sig.timestamp)}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                  <div className="text-[10px] text-[#A8A09A] mb-1 uppercase tracking-wider font-medium">Entry</div>
                  <div className="text-sm font-mono font-semibold text-[#F5F0E8]">{sig.price}</div>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
                  <div className="text-[10px] text-emerald-400/60 mb-1 uppercase tracking-wider font-medium">Target</div>
                  <div className="text-sm font-mono font-semibold text-emerald-400">{sig.target}</div>
                </div>
                <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20">
                  <div className="text-[10px] text-red-400/60 mb-1 uppercase tracking-wider font-medium">Stop Loss</div>
                  <div className="text-sm font-mono font-semibold text-red-400">{sig.stopLoss}</div>
                </div>
              </div>

              <div className="text-xs text-[#A8A09A] leading-relaxed mb-3 line-clamp-2">{sig.reasoning}</div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/[0.06] rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${sig.confidence}%`, background: "linear-gradient(90deg, #E8610A, #F5A020)" }} />
                </div>
                <span className="text-xs font-mono font-semibold text-[#F5A020]">{sig.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Meme Rush */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="icon-box">
              <span className="text-xs">🔥</span>
            </div>
            <h2 className="text-sm font-bold text-[#F5F0E8]">Meme Rush</h2>
          </div>
          <span className="pill-badge text-[10px]">{memes.length} trending</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {memes.map((meme) => (
            <div key={meme.symbol} className="glass-card-hover p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-[#0E0804]" style={{ background: "linear-gradient(135deg, #E8610A, #F5A020)" }}>
                    {meme.symbol.slice(0, 2)}
                  </div>
                  <span className="font-bold text-sm text-[#F5F0E8]">{meme.symbol}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getRiskClass(meme.risk)}`}>
                  {meme.risk}
                </span>
              </div>
              <div className="text-sm font-mono font-semibold text-[#F5F0E8] mb-1">{meme.price}</div>
              <div className={`text-xs font-mono font-semibold ${meme.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {meme.change24h >= 0 ? "+" : ""}{meme.change24h.toFixed(2)}% <span className="text-[#A8A09A] font-normal">24h</span>
              </div>
              <div className="text-[10px] text-[#A8A09A] mt-2">Vol: {meme.volume}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
