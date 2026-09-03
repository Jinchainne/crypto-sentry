"use client";

import { useEffect, useState, useRef } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Ticker {
  symbol: string;
  price: string;
  change: number;
}

const DEMO_TICKERS: Ticker[] = [
  { symbol: "BTC", price: "65,234.50", change: 1.56 },
  { symbol: "ETH", price: "3,118.50", change: 2.34 },
  { symbol: "BNB", price: "600.00", change: -1.23 },
  { symbol: "SOL", price: "178.90", change: 5.67 },
  { symbol: "XRP", price: "0.6234", change: -0.45 },
  { symbol: "DOGE", price: "0.1567", change: 8.90 },
  { symbol: "ADA", price: "0.4523", change: 1.12 },
  { symbol: "AVAX", price: "35.67", change: 3.45 },
];

export default function MarketTicker() {
  const [tickers, setTickers] = useState<Ticker[]>(DEMO_TICKERS);
  const trackRef = useRef<HTMLDivElement>(null);

  // Duplicate for seamless scroll
  const items = [...tickers, ...tickers];

  return (
    <div className="overflow-hidden border-y border-white/[0.06] py-2 mb-6">
      <div
        ref={trackRef}
        className="flex gap-8 animate-ticker"
        style={{ width: "max-content" }}
      >
        {items.map((t, i) => (
          <div key={`${t.symbol}-${i}`} className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-[#F5F0E8]">{t.symbol}</span>
            <span className="text-xs font-mono text-[#A8A09A]">${t.price}</span>
            <span className={`text-xs font-semibold flex items-center gap-0.5 ${t.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {t.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {t.change >= 0 ? "+" : ""}{t.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
