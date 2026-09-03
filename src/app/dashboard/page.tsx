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
    <main className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-white/30 text-sm">Real-time crypto intelligence powered by Binance Skills Hub</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-green border rounded-xl p-4">
          <div className="text-2xl mb-2">📈</div>
          <div className="text-2xl font-bold text-green-400">{signals.length}</div>
          <div className="text-xs text-white/40 mt-1">Active Signals</div>
        </div>
        <div className="stat-amber border rounded-xl p-4">
          <div className="text-2xl mb-2">🪙</div>
          <div className="text-2xl font-bold text-amber-400">{market.length}</div>
          <div className="text-xs text-white/40 mt-1">Tokens Tracked</div>
        </div>
        <div className="stat-red border rounded-xl p-4">
          <div className="text-2xl mb-2">🔥</div>
          <div className="text-2xl font-bold text-red-400">{memes.length}</div>
          <div className="text-xs text-white/40 mt-1">Meme Tokens</div>
        </div>
        <div className="stat-blue border rounded-xl p-4">
          <div className="text-2xl mb-2">🤖</div>
          <div className="text-2xl font-bold text-blue-400">6</div>
          <div className="text-xs text-white/40 mt-1">Skills Active</div>
        </div>
      </div>

      {/* Market Rankings */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>📊</span> Market Rankings
        </h2>
        <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/30 bg-white/[0.03]">
                <th className="text-left px-4 py-3 font-medium">#</th>
                <th className="text-left px-4 py-3 font-medium">Token</th>
                <th className="text-right px-4 py-3 font-medium">Price</th>
                <th className="text-right px-4 py-3 font-medium">24h</th>
                <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Volume</th>
                <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {market.map((item) => (
                <tr key={item.symbol} className="border-b border-white/5 transition-colors">
                  <td className="px-4 py-3 text-white/30 font-mono">{item.rank}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-400">
                        {item.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <span className="font-semibold text-white">{item.symbol}</span>
                        <span className="text-white/30 ml-2 text-xs">{item.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-white/80">{item.price}</td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${item.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {formatPercent(item.change24h)}
                  </td>
                  <td className="px-4 py-3 text-right text-white/40 hidden md:table-cell">{item.volume24h}</td>
                  <td className="px-4 py-3 text-right text-white/40 hidden md:table-cell">{item.marketCap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Signals */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>📈</span> Latest Signals
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {signals.map((sig) => (
            <div key={sig.id} className={`border border-white/10 rounded-xl p-5 bg-white/[0.02] card-hover ${sig.direction === "BUY" ? "signal-buy" : sig.direction === "SELL" ? "signal-sell" : "signal-hold"}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm font-bold text-amber-400">
                    {sig.token.slice(0, 2)}
                  </div>
                  <div>
                    <span className="font-bold text-lg text-white">{sig.token}</span>
                    <span className={`ml-2 text-xs px-2.5 py-1 rounded-full font-bold ${sig.direction === "BUY" ? "bg-green-500/20 text-green-400 border border-green-500/30" : sig.direction === "SELL" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"}`}>
                      {sig.direction}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-white/30">{timeAgo(sig.timestamp)}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">Entry</div>
                  <div className="text-sm font-mono font-semibold text-white">{sig.price}</div>
                </div>
                <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                  <div className="text-[10px] text-green-400/60 mb-1 uppercase tracking-wider">Target</div>
                  <div className="text-sm font-mono font-semibold text-green-400">{sig.target}</div>
                </div>
                <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                  <div className="text-[10px] text-red-400/60 mb-1 uppercase tracking-wider">Stop Loss</div>
                  <div className="text-sm font-mono font-semibold text-red-400">{sig.stopLoss}</div>
                </div>
              </div>

              <div className="text-xs text-white/40 leading-relaxed mb-3 line-clamp-2">{sig.reasoning}</div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all" style={{ width: `${sig.confidence}%` }} />
                </div>
                <span className="text-xs text-amber-400 font-mono font-semibold">{sig.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Meme Rush */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🔥</span> Meme Rush
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {memes.map((meme) => (
            <div key={meme.symbol} className="border border-white/10 rounded-xl p-4 bg-white/[0.02] card-hover">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-400">
                    {meme.symbol.slice(0, 2)}
                  </div>
                  <span className="font-bold text-sm text-white">{meme.symbol}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getRiskClass(meme.risk)}`}>
                  {meme.risk}
                </span>
              </div>
              <div className="text-sm font-mono font-semibold text-white mb-1">{meme.price}</div>
              <div className={`text-xs font-mono font-semibold ${meme.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatPercent(meme.change24h)} <span className="text-white/20 font-normal">24h</span>
              </div>
              <div className="text-[10px] text-white/20 mt-2">Vol: {meme.volume}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
