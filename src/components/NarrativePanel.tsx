"use client";

import { useEffect, useState } from "react";

interface SectorScore {
  sector: string;
  score: number;
  momentum: number;
  detail: string;
}

const SECTOR_ICONS: Record<string, string> = {
  majors: "₿",
  layer1: "🔗",
  defi: "🏦",
  meme: "🐸",
  ai: "🤖",
  payments: "💳",
};

export default function NarrativePanel() {
  const [ranked, setRanked] = useState<SectorScore[]>([]);
  const [leader, setLeader] = useState("");

  useEffect(() => {
    fetch("/api/signals")
      .then((r) => r.json())
      .then((data) => {
        setRanked(data.narrative?.ranked ?? []);
        setLeader(data.narrative?.leader ?? "");
      })
      .catch(() => {});
  }, []);

  if (ranked.length === 0) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-6 w-48 bg-white/[0.06] rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-white/[0.06] rounded" />
          ))}
        </div>
      </div>
    );
  }

  const maxMom = Math.max(...ranked.map((r) => Math.abs(r.momentum)), 0.001);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="icon-box">
            <span className="text-xs">🔄</span>
          </div>
          <h2 className="text-sm font-bold text-[#F5F0E8]">Narrative Rotation</h2>
        </div>
        <span className="pill-badge-orange text-[10px]">
          {leader.toUpperCase()} leading
        </span>
      </div>

      <div className="space-y-2">
        {ranked.map((item, idx) => {
          const barPct = Math.round((Math.abs(item.momentum) / maxMom) * 100);
          const isPositive = item.momentum >= 0;
          const isLeader = item.sector === leader;

          return (
            <div
              key={item.sector}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                isLeader ? "bg-[#E8610A]/10 border border-[#E8610A]/20" : "bg-white/[0.02]"
              }`}
            >
              <span className="text-xs w-5 text-center text-[#A8A09A] font-mono">#{idx + 1}</span>
              <span className="text-sm">{SECTOR_ICONS[item.sector] ?? "📊"}</span>
              <span className={`text-xs font-bold uppercase w-16 ${isLeader ? "text-[#F5A020]" : "text-[#F5F0E8]"}`}>
                {item.sector}
              </span>
              <div className="flex-1 bg-white/[0.06] rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isPositive ? "bg-emerald-500" : "bg-red-500"
                  }`}
                  style={{ width: `${barPct}%` }}
                />
              </div>
              <span className={`text-xs font-mono font-semibold w-14 text-right ${
                isPositive ? "text-emerald-400" : "text-red-400"
              }`}>
                {isPositive ? "+" : ""}{(item.momentum * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
