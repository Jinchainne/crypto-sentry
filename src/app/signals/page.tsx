"use client";

import { useEffect, useState } from "react";
import type { TradingSignal } from "@/lib/types";
import { getDirectionColor, timeAgo } from "@/lib/utils";

export default function SignalsPage() {
  const [signals, setSignals] = useState<TradingSignal[]>([]);

  useEffect(() => {
    import("@/lib/skills/trading-signal").then(m => m.getSignals().then(setSignals));
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 mesh-gradient">
      <h1 className="text-2xl font-bold mb-2">Trading Signals</h1>
      <p className="text-white/40 text-sm mb-6">AI-powered signals from Binance Skills Hub — wallet tracking, market analysis, and sentiment combined.</p>

      <div className="space-y-4">
        {signals.map((sig) => (
          <div key={sig.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-amber-500/30 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">{sig.token}</span>
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${getDirectionColor(sig.direction)}`}>
                  {sig.direction}
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-24 bg-white/10 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${sig.confidence}%` }} />
                  </div>
                  <span className="text-xs text-white/40">{sig.confidence}%</span>
                </div>
              </div>
              <span className="text-xs text-white/40">{timeAgo(sig.timestamp)}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-xs text-white/40 mb-1">Entry Price</div>
                <div className="text-lg font-mono font-bold">{sig.price}</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <div className="text-xs text-green-400/60 mb-1">Target</div>
                <div className="text-lg font-mono font-bold text-green-400">{sig.target}</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <div className="text-xs text-red-400/60 mb-1">Stop Loss</div>
                <div className="text-lg font-mono font-bold text-red-400">{sig.stopLoss}</div>
              </div>
            </div>

            <div className="text-sm text-white/60 leading-relaxed">{sig.reasoning}</div>
            <div className="mt-3 text-xs text-white/30">Source: {sig.source}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
