"use client";

import { useEffect, useState } from "react";

interface NewsItem {
  id: string;
  title: string;
  releaseTime: number;
  matchedSymbols: string[];
  tags: string[];
  engagement: number;
  sentiment: number;
}

function SentimentDot({ score }: { score: number }) {
  const color = score > 0.15 ? "bg-emerald-400" : score < -0.15 ? "bg-red-400" : "bg-yellow-400";
  return <div className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NewsFeed() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [overall, setOverall] = useState(0);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setOverall(data.overallSentiment ?? 0);
      })
      .catch(() => {});
  }, []);

  const tone = overall > 0.15 ? "Bullish" : overall < -0.15 ? "Bearish" : "Mixed";
  const toneColor = overall > 0.15 ? "text-emerald-400" : overall < -0.15 ? "text-red-400" : "text-yellow-400";

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="icon-box">
            <span className="text-xs">📰</span>
          </div>
          <h2 className="text-sm font-bold text-[#F5F0E8]">News Feed</h2>
        </div>
        <div className="flex items-center gap-2">
          <SentimentDot score={overall} />
          <span className={`text-xs font-semibold ${toneColor}`}>{tone}</span>
          <span className="pill-badge text-[10px]">{items.length} items</span>
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
        {items.slice(0, 20).map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/[0.03]"
          >
            <SentimentDot score={item.sentiment} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#F5F0E8] leading-relaxed line-clamp-2">{item.title}</p>
              <div className="flex items-center gap-2 mt-1">
                {item.matchedSymbols.slice(0, 3).map((sym) => (
                  <span key={sym} className="text-[9px] px-1.5 py-0.5 rounded bg-[#E8610A]/10 text-[#E8610A] font-semibold">
                    {sym}
                  </span>
                ))}
                <span className="text-[10px] text-[#A8A09A]">{timeAgo(item.releaseTime)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
