"use client";

import { useEffect, useState } from "react";

interface SignalBundle {
  regime: {
    regime: string;
    vol: string;
    score: number;
    confidence: number;
    rationale: string[];
    signals: {
      flow: { score: number; detail: string; trend: string };
      sentiment: { score: number; detail: string; sampleSize: number };
      volatility: { score: number; detail: string; annualizedVol: number; state: string };
    };
  };
  narrative: {
    leader: string;
    ranked: { sector: string; score: number; momentum: number; detail: string }[];
  };
}

const REGIME_COLORS: Record<string, { bg: string; text: string; glow: string; label: string }> = {
  risk_on: { bg: "bg-emerald-500/20", text: "text-emerald-400", glow: "shadow-emerald-500/20", label: "Risk-On" },
  neutral: { bg: "bg-yellow-500/20", text: "text-yellow-400", glow: "shadow-yellow-500/20", label: "Neutral" },
  risk_off: { bg: "bg-red-500/20", text: "text-red-400", glow: "shadow-red-500/20", label: "Risk-Off" },
};

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  const pct = Math.round(((score + 1) / 2) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-[#A8A09A] uppercase tracking-wider font-medium w-20">{label}</span>
      <div className="flex-1 bg-white/[0.06] rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-[#F5F0E8] w-10 text-right">
        {score >= 0 ? "+" : ""}{score.toFixed(2)}
      </span>
    </div>
  );
}

export default function RegimeHero() {
  const [data, setData] = useState<SignalBundle | null>(null);

  useEffect(() => {
    fetch("/api/signals")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-6 w-48 bg-white/[0.06] rounded mb-4" />
        <div className="h-4 w-full bg-white/[0.06] rounded mb-2" />
        <div className="h-4 w-3/4 bg-white/[0.06] rounded" />
      </div>
    );
  }

  const { regime, narrative } = data;
  const r = REGIME_COLORS[regime.regime] ?? REGIME_COLORS.neutral;
  const scoreColor = regime.score > 0.2 ? "bg-emerald-500" : regime.score < -0.2 ? "bg-red-500" : "bg-yellow-500";

  return (
    <div className={`glass-card p-6 border-l-4 ${
      regime.regime === "risk_on" ? "border-l-emerald-500" :
      regime.regime === "risk_off" ? "border-l-red-500" : "border-l-yellow-500"
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="icon-box">
            <span className="text-xs">🧭</span>
          </div>
          <h2 className="text-sm font-bold text-[#F5F0E8]">Market Regime</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.bg} ${r.text} border border-current/20`}>
            {r.label}
          </span>
          <span className="pill-badge-orange text-[10px]">
            {Math.round(regime.confidence * 100)}% conf
          </span>
        </div>
      </div>

      {/* Composite score */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[#A8A09A] uppercase tracking-wider font-medium">Composite Score</span>
          <span className={`text-sm font-bold font-mono ${r.text}`}>
            {regime.score >= 0 ? "+" : ""}{regime.score.toFixed(2)}
          </span>
        </div>
        <div className="w-full bg-white/[0.06] rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${scoreColor}`}
            style={{ width: `${Math.round(((regime.score + 1) / 2) * 100)}%` }}
          />
        </div>
      </div>

      {/* Signal meters */}
      <div className="space-y-2 mb-5">
        <ScoreBar
          label="Flows"
          score={regime.signals.flow.score}
          color={regime.signals.flow.score > 0 ? "bg-emerald-500" : "bg-red-500"}
        />
        <ScoreBar
          label="Sentiment"
          score={regime.signals.sentiment.score}
          color={regime.signals.sentiment.score > 0 ? "bg-emerald-500" : "bg-red-500"}
        />
        <ScoreBar
          label="Volatility"
          score={regime.signals.volatility.score}
          color={regime.signals.volatility.score > 0 ? "bg-emerald-500" : "bg-red-500"}
        />
      </div>

      {/* Leading narrative */}
      <div className="flex items-center gap-2 p-3 bg-white/[0.03] rounded-xl border border-white/[0.05]">
        <span className="text-xs">🚀</span>
        <span className="text-xs text-[#A8A09A]">Leading narrative:</span>
        <span className="text-xs font-bold text-[#F5A020] uppercase">{narrative.leader}</span>
      </div>
    </div>
  );
}
