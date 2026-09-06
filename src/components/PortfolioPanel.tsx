"use client";

import { useEffect, useState } from "react";

interface Position {
  symbol: string;
  quantity: number;
  avgEntry: number;
  currentPrice: number;
  unrealizedPnl: number;
  side: string;
}

interface PortfolioData {
  mode: string;
  cash: number;
  positions: Position[];
  realizedPnl: number;
  totalValue: number;
  dailyPnl: number;
  allocation: { symbol: string; percent: number; value: number }[];
}

export default function PortfolioPanel() {
  const [data, setData] = useState<PortfolioData | null>(null);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
    const interval = setInterval(() => {
      fetch("/api/portfolio")
        .then((r) => r.json())
        .then(setData)
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <div className="glass-card p-5 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-32 mb-4" />
        <div className="h-8 bg-white/10 rounded w-24" />
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="icon-box">
            <span className="text-xs">💼</span>
          </div>
          <h3 className="text-sm font-bold text-[#F5F0E8]">Portfolio</h3>
        </div>
        <span className="pill-badge-orange text-[10px]">
          {data.mode.toUpperCase()} MODE
        </span>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
          <div className="text-[10px] text-[#A8A09A] mb-1 uppercase tracking-wider font-medium">
            Total Value
          </div>
          <div className="text-lg font-mono font-bold text-[#F5F0E8]">
            ${data.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
          <div className="text-[10px] text-[#A8A09A] mb-1 uppercase tracking-wider font-medium">
            Daily P&L
          </div>
          <div
            className={`text-lg font-mono font-bold ${
              data.dailyPnl >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {data.dailyPnl >= 0 ? "+" : ""}$
            {data.dailyPnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
          <div className="text-[10px] text-[#A8A09A] mb-1 uppercase tracking-wider font-medium">
            Cash
          </div>
          <div className="text-lg font-mono font-bold text-[#F5F0E8]">
            ${data.cash.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Positions */}
      {data.positions.length > 0 ? (
        <div className="space-y-2">
          <div className="text-[10px] text-[#A8A09A] uppercase tracking-wider font-medium mb-2">
            Positions
          </div>
          {data.positions.map((pos) => (
            <div
              key={pos.symbol}
              className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/[0.05]"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-[#0E0804]"
                  style={{
                    background: "linear-gradient(135deg, #E8610A, #F5A020)",
                  }}
                >
                  {pos.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#F5F0E8]">
                    {pos.symbol}
                  </div>
                  <div className="text-[10px] text-[#A8A09A]">
                    {pos.quantity.toFixed(4)} @ ${pos.avgEntry.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm text-[#F5F0E8]">
                  ${pos.currentPrice.toLocaleString()}
                </div>
                <div
                  className={`text-xs font-mono font-semibold ${
                    pos.unrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {pos.unrealizedPnl >= 0 ? "+" : ""}$
                  {pos.unrealizedPnl.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-[#A8A09A] text-sm">
          No open positions. Start trading to build your portfolio.
        </div>
      )}

      {/* Allocation bar */}
      {data.allocation.length > 0 && (
        <div className="mt-4">
          <div className="text-[10px] text-[#A8A09A] uppercase tracking-wider font-medium mb-2">
            Allocation
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-white/[0.05]">
            {data.allocation.map((a, i) => {
              const colors = [
                "#E8610A",
                "#F5A020",
                "#10B981",
                "#3B82F6",
                "#8B5CF6",
              ];
              return (
                <div
                  key={a.symbol}
                  className="h-full"
                  style={{
                    width: `${a.percent}%`,
                    backgroundColor: colors[i % colors.length],
                  }}
                  title={`${a.symbol}: ${a.percent.toFixed(1)}%`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {data.allocation.map((a, i) => {
              const colors = [
                "#E8610A",
                "#F5A020",
                "#10B981",
                "#3B82F6",
                "#8B5CF6",
              ];
              return (
                <div key={a.symbol} className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: colors[i % colors.length],
                    }}
                  />
                  <span className="text-[10px] text-[#A8A09A]">
                    {a.symbol} {a.percent.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
