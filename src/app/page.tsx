"use client";

import { useRef } from "react";
import AgentChat from "@/components/AgentChat";

const FEATURES = [
  {
    icon: "🔍",
    title: "Token Info",
    desc: "Deep-dive any token — price, volume, supply, and market data from Binance.",
  },
  {
    icon: "🛡️",
    title: "Security Audit",
    desc: "Smart-contract risk scoring, honeypot detection, and holder analysis.",
  },
  {
    icon: "📈",
    title: "Trading Signals",
    desc: "AI-generated buy/sell/hold signals with RSI, MACD, and momentum indicators.",
  },
  {
    icon: "🐋",
    title: "Wallet Tracking",
    desc: "Monitor whale wallets in real-time — inflows, outflows, and activity alerts.",
  },
  {
    icon: "🔥",
    title: "Meme Rush",
    desc: "Catch trending meme coins early with volume spikes and social momentum.",
  },
  {
    icon: "📊",
    title: "Market Rankings",
    desc: "Top gainers, losers, and trending tokens across the entire crypto market.",
  },
];

const STATS = [
  { value: "6", label: "Skills Active" },
  { value: "24/7", label: "Real-time Data" },
  { value: "Multi", label: "Chain Support" },
];

export default function Home() {
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToChat = () => {
    chatRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen">
      {/* ─── Hero Section ─── */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-12 pb-16 md:pt-20 md:pb-24 text-center overflow-hidden">
        {/* Decorative orbs behind hero */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(232,97,10,0.18) 0%, transparent 60%)",
            filter: "blur(80px)",
            mixBlendMode: "screen",
            opacity: 0.45,
          }}
        />

        {/* Badge */}
        <div className="pill-badge-orange text-xs mb-6 animate-fade-in-up">
          <span className="live-dot mr-1" />
          Powered by Binance Skills Hub
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-5 animate-fade-in-up"
          style={{ animationDelay: "0.08s" }}
        >
          <span className="orange-gradient-text">AI Crypto</span>
          <br />
          <span className="text-[#F5F0E8]">Intelligence</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-[#A8A09A] text-base sm:text-lg md:text-xl max-w-xl mb-8 animate-fade-in-up"
          style={{ animationDelay: "0.16s" }}
        >
          6 skills, one agent — token analysis, security audits, trading
          signals, wallet tracking, meme coins, and market rankings.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-3 mb-12 animate-fade-in-up"
          style={{ animationDelay: "0.24s" }}
        >
          <button onClick={scrollToChat} className="orange-btn text-sm md:text-base px-8 py-3">
            Launch Agent ↓
          </button>
          <a href="/dashboard" className="orange-btn-outline text-sm md:text-base px-8 py-3 text-center">
            View Dashboard
          </a>
        </div>

        {/* Stats Row */}
        <div
          className="flex flex-wrap justify-center gap-6 md:gap-10 mb-16 animate-fade-in-up"
          style={{ animationDelay: "0.32s" }}
        >
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <span className="text-2xl md:text-3xl font-bold orange-gradient-text">
                {s.value}
              </span>
              <span className="text-xs text-[#A8A09A] uppercase tracking-widest">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Feature Grid ─── */}
      <section className="px-4 pb-16 md:pb-24 max-w-6xl mx-auto">
        <h2 className="text-center text-xs uppercase tracking-[0.2em] text-[#A8A09A] mb-8 font-medium">
          Agent Skills
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="glass-card-hover p-5 flex flex-col gap-3 group animate-fade-in-up"
              style={{ animationDelay: `${0.06 * i}s` }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="text-sm font-semibold text-[#F5F0E8] group-hover:text-[#E8610A] transition-colors">
                  {f.title}
                </h3>
              </div>
              <p className="text-xs text-[#A8A09A] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(232,97,10,0.3)] to-transparent" />
      </div>

      {/* ─── Chat Section ─── */}
      <section ref={chatRef} id="chat" className="px-4 pt-10 pb-8 max-w-4xl mx-auto">
        <AgentChat />
      </section>
    </main>
  );
}
