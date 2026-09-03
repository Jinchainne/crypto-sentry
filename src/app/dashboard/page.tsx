"use client";

import { useEffect, useState } from "react";
import type { MarketRankItem, TradingSignal, MemeToken } from "@/lib/types";
import { formatNumber, formatPercent, getDirectionColor, getRiskColor, timeAgo } from "@/lib/utils";

export default function DashboardPage() {
  const [market, setMarket] = useState<MarketRankItem[]>([]);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [memes, setMemes] = useState<MemeToken[]>([]);

  useEffect(() => {
    fetch("/api/skills").then(r => r.json()).then(data => {
      // Skills loaded
    });
    // Load demo data
    import("@/lib/skills/market-rank").then(m => m.getMarketRank().then(setMarket));
    import("@/lib/skills/trading-signal").then(m => m.getSignals().then(setSignals));
    import("@/lib/skills/meme-rush").then(m => m.getMemeRush().then(setMemes));
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 mesh-gradient">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Signals", value: signals.length.toString(), icon: "📈" },
          { label: "Tokens Tracked", value: market.length.toString(), icon: "🪙" },
          { label: "Meme Tokens", value: memes.length.toString(), icon: "🔥" },
          { label: "Skills Active", value: "6", icon: "🤖" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-white/40">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Market Rankings */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">📊 Market Rankings</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40">
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">Token</th>
                <th className="text-right px-4 py-3">Price</th>
                <th className="text-right px-4 py-3">24h</th>
                <th className="text-right px-4 py-3">Volume</th>
                <th className="text-right px-4 py-3">Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {market.map((item) => (
                <tr key={item.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white/40">{item.rank}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{item.symbol}</span>
                    <span className="text-white/40 ml-2">{item.name}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{item.price}</td>
                  <td className={`px-4 py-3 text-right font-mono ${item.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {formatPercent(item.change24h)}
                  </td>
                  <td className="px-4 py-3 text-right text-white/60">{item.volume24h}</td>
                  <td className="px-4 py-3 text-right text-white/60">{item.marketCap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Signals */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">📈 Latest Signals</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {signals.map((sig) => (
            <div key={sig.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{sig.token}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getDirectionColor(sig.direction)}`}>
                    {sig.direction}
                  </span>
                </div>
                <span className="text-xs text-white/40">{timeAgo(sig.timestamp)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                <div>
                  <div className="text-white/40">Entry</div>
                  <div className="font-mono">{sig.price}</div>
                </div>
                <div>
                  <div className="text-white/40">Target</div>
                  <div className="font-mono text-green-400">{sig.target}</div>
                </div>
                <div>
                  <div className="text-white/40">Stop Loss</div>
                  <div className="font-mono text-red-400">{sig.stopLoss}</div>
                </div>
              </div>
              <div className="text-xs text-white/50 line-clamp-2">{sig.reasoning}</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-white/10 rounded-full h-1.5">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full"
                    style={{ width: `${sig.confidence}%` }}
                  />
                </div>
                <span className="text-xs text-white/40">{sig.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Meme Rush */}
      <section>
        <h2 className="text-lg font-semibold mb-4">🔥 Meme Rush</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {memes.map((meme) => (
            <div key={meme.symbol} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">{meme.symbol}</span>
                <span className={`text-xs ${getRiskColor(meme.risk)}`}>{meme.risk}</span>
              </div>
              <div className="text-sm font-mono mb-1">{meme.price}</div>
              <div className={`text-xs font-mono ${meme.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatPercent(meme.change24h)} (24h)
              </div>
              <div className="text-xs text-white/30 mt-1">Vol: {meme.volume}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
