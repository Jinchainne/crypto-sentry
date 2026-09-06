"use client";

import { useEffect, useState, useRef } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Ticker {
  symbol: string;
  price: string;
  change: number;
}

export default function MarketTicker() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/skills/market")
      .then((r) => r.json())
      .then((data: Array<{ symbol: string; price: string; change24h: number }>) => {
        const mapped = data.map((d) => ({
          symbol: d.symbol,
          price: d.price.replace("$", ""),
          change: d.change24h,
        }));
        setTickers(mapped);
      })
      .catch(() => {});
  }, []);

  // Duplicate for seamless scroll
  const items = tickers.length > 0 ? [...tickers, ...tickers] : [];

  if (items.length === 0) return null;

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
