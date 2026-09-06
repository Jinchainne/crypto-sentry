"use client";

import { useEffect, useState } from "react";
import type { TradingSignal } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export default function SignalsPage() {
  const [signals, setSignals] = useState<TradingSignal[]>([]);

  useEffect(() => {
    fetch("/api/skills/signals").then(r => r.json()).then(setSignals).catch(() => {});
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 text-[#F5F0E8]">Trading Signals</h1>
        <p className="text-[#A8A09A] text-sm">AI-powered signals from Binance Skills Hub — wallet tracking, market analysis, and sentiment combined.</p>
      </div>

      <div className="space-y-4">
        {signals.map((sig) => (
          <div key={sig.id} className={`glass-card-hover p-6 ${sig.direction === "BUY" ? "signal-buy" : sig.direction === "SELL" ? "signal-sell" : "signal-hold"}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-[#0E0804]" style={{ background: "linear-gradient(135deg, #E8610A, #F5A020)" }}>
                  {sig.token.slice(0, 2)}
                </div>
                <div>
                  <span className="text-2xl font-bold text-[#F5F0E8]">{sig.token}</span>
                  <span className={`ml-3 text-sm px-3 py-1 rounded-full font-bold ${sig.direction === "BUY" ? "bg-green-500/20 text-green-400 border border-green-500/30" : sig.direction === "SELL" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-[rgba(245,160,32,0.2)] text-[#F5A020] border border-[rgba(245,160,32,0.3)]"}`}>
                    {sig.direction}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-white/[0.06] rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${sig.confidence}%`, background: "linear-gradient(90deg, #E8610A, #F5A020)" }} />
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#F5A020]">{sig.confidence}%</span>
                </div>
                <span className="text-xs text-[#A8A09A]">{timeAgo(sig.timestamp)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
                <div className="text-[10px] text-[#A8A09A] mb-1 uppercase tracking-wider">Entry Price</div>
                <div className="text-xl font-mono font-bold text-[#F5F0E8]">{sig.price}</div>
              </div>
              <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                <div className="text-[10px] text-green-400/60 mb-1 uppercase tracking-wider">Target</div>
                <div className="text-xl font-mono font-bold text-green-400">{sig.target}</div>
              </div>
              <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                <div className="text-[10px] text-red-400/60 mb-1 uppercase tracking-wider">Stop Loss</div>
                <div className="text-xl font-mono font-bold text-red-400">{sig.stopLoss}</div>
              </div>
            </div>

            <div className="text-sm text-[#A8A09A] leading-relaxed">{sig.reasoning}</div>
            <div className="mt-3 text-xs text-[#A8A09A]/60">Source: {sig.source}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
