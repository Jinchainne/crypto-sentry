"use client";

import { useRef, useState, useEffect } from "react";
import AgentChat from "@/components/AgentChat";
import type { MarketRankItem, TradingSignal, MemeToken } from "@/lib/types";

/* ─── Data ─── */
const FEATURES = [
  { icon: "🔍", title: "Token Info", desc: "Deep-dive any token — price, volume, supply, and market data from Binance.", endpoint: "/api/skills/tokens" },
  { icon: "🛡️", title: "Security Audit", desc: "Smart-contract risk scoring, honeypot detection, and holder analysis.", endpoint: "/api/skills/tokens" },
  { icon: "📈", title: "Trading Signals", desc: "AI-generated buy/sell/hold signals with RSI, MACD, and momentum indicators.", endpoint: "/api/skills/signals" },
  { icon: "🐋", title: "Wallet Tracking", desc: "Monitor whale wallets in real-time — inflows, outflows, and activity alerts.", endpoint: "/api/skills/tokens" },
  { icon: "🔥", title: "Meme Rush", desc: "Catch trending meme coins early with volume spikes and social momentum.", endpoint: "/api/skills/memes" },
  { icon: "📊", title: "Market Rankings", desc: "Top gainers, losers, and trending tokens across the entire crypto market.", endpoint: "/api/skills/market" },
];

const STATS = [
  { value: 6, suffix: "", label: "Skills Active", icon: "⚡" },
  { value: 24, suffix: "/7", label: "Real-time Data", icon: "📡" },
  { value: 8, suffix: "+", label: "Chains Supported", icon: "🔗" },
  { value: 100, suffix: "%", label: "AI-Powered", icon: "🤖" },
];

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix, duration = 1500 }: { target: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Change Bar ─── */
function ChangeBar({ value }: { value: number }) {
  const width = Math.min(Math.abs(value) * 3, 100);
  const color = value >= 0 ? "#4ade80" : "#ef4444";
  return (
    <div className="w-16 h-1 bg-white/[0.06] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${width}%`, background: color }}
      />
    </div>
  );
}

/* ─── Typewriter Text ─── */
function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 60);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [started, text, delay]);

  return (
    <span ref={ref}>
      {displayed}
      {displayed.length < text.length && started && (
        <span className="inline-block w-[3px] h-[1em] bg-[#E8610A] ml-1 align-middle" style={{ animation: "typewriter-cursor 0.8s step-end infinite" }} />
      )}
    </span>
  );
}

/* ─── Main Component ─── */
export default function Home() {
  const chatRef = useRef<HTMLDivElement>(null);
  const [market, setMarket] = useState<MarketRankItem[]>([]);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [memes, setMemes] = useState<MemeToken[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [marketRes, signalsRes, memesRes] = await Promise.allSettled([
          fetch("/api/skills/market").then(r => r.json()),
          fetch("/api/skills/signals").then(r => r.json()),
          fetch("/api/skills/memes").then(r => r.json()),
        ]);
        if (marketRes.status === "fulfilled") setMarket(marketRes.value);
        if (signalsRes.status === "fulfilled") setSignals(signalsRes.value);
        if (memesRes.status === "fulfilled") setMemes(memesRes.value);
      } catch (e) {
        console.error("Failed to fetch data:", e);
      } finally {
        setDataLoading(false);
      }
    }
    fetchData();
  }, []);

  const scrollToChat = () => {
    chatRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const topSignals = signals.slice(0, 3);
  const topMarket = market.slice(0, 5);
  const topMemes = memes.slice(0, 6);

  return (
    <main className="min-h-screen relative">
      {/* ─── Background Effects ─── */}
      <div className="gradient-mesh" />
      <div className="grid-overlay" />
      <div className="noise-overlay" />

      {/* ─── Price Ticker Strip ─── */}
      <section className="relative z-10 border-b border-white/[0.04] bg-black/20 backdrop-blur-sm">
        <div className="ticker-strip py-3">
          <div className="ticker-inner">
            {[...market.slice(0, 8), ...market.slice(0, 8)].map((coin, i) => (
              <div key={`${coin.symbol}-${i}`} className="ticker-item">
                <span className="symbol">{coin.symbol}</span>
                <span className="price">{coin.price}</span>
                <span className={coin.change24h >= 0 ? "change-positive" : "change-negative"}>
                  {coin.change24h >= 0 ? "▲" : "▼"} {Math.abs(coin.change24h).toFixed(2)}%
                </span>
                {i < 15 && <span className="text-white/10 mx-2">|</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Hero Section ─── */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-16 pb-20 md:pt-24 md:pb-28 text-center overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none animate-orb-1" style={{ background: "radial-gradient(circle, rgba(232,97,10,0.15) 0%, transparent 60%)", filter: "blur(80px)" }} />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none animate-orb-2" style={{ background: "radial-gradient(circle, rgba(245,160,32,0.10) 0%, transparent 60%)", filter: "blur(60px)" }} />

        {/* Badge */}
        <div className="pill-badge-orange text-xs mb-8 animate-fade-in-up">
          <span className="live-dot-orange mr-1" />
          Powered by Binance Skills Hub
        </div>

        {/* Headline with typewriter */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-[1.05] mb-6 animate-fade-in-up" style={{ animationDelay: "0.08s" }}>
          <span className="orange-gradient-text-bright">
            <TypewriterText text="AI Crypto" delay={300} />
          </span>
          <br />
          <span className="text-[#F5F0E8]" style={{ opacity: 0.95 }}>
            <TypewriterText text="Intelligence" delay={900} />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-[#A8A09A] text-base sm:text-lg md:text-xl max-w-2xl mb-10 animate-fade-in-up leading-relaxed" style={{ animationDelay: "0.16s" }}>
          6 autonomous skills, one AI agent — token analysis, security audits, trading
          signals, wallet tracking, meme detection, and market intelligence.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-14 animate-fade-in-up" style={{ animationDelay: "0.24s" }}>
          <button onClick={scrollToChat} className="orange-btn text-sm md:text-base px-10 py-4 animate-pulse-glow">
            ⚡ Launch Agent
          </button>
          <a href="/dashboard" className="orange-btn-outline text-sm md:text-base px-10 py-4 text-center">
            View Dashboard →
          </a>
        </div>

        {/* Animated Stats */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-16 animate-fade-in-up" style={{ animationDelay: "0.32s" }}>
          {STATS.map((s) => (
            <div key={s.label} className="stat-card items-center min-w-[120px]">
              <span className="text-lg mb-1">{s.icon}</span>
              <span className="text-2xl md:text-3xl font-bold orange-gradient-text">
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </span>
              <span className="text-[10px] text-[#A8A09A] uppercase tracking-widest font-medium">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Floating Signal Preview Card */}
        <div className="animate-fade-in-up animate-float-delayed max-w-md w-full" style={{ animationDelay: "0.5s" }}>
          <div className="gradient-border-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0E0804] font-bold text-xs" style={{ background: "linear-gradient(135deg, #E8610A, #F5A020)" }}>
                📈
              </div>
              <div>
                <p className="text-xs text-[#A8A09A]">Latest Signal</p>
                <p className="text-sm font-semibold text-[#F5F0E8]">
                  {topSignals[0] ? `${topSignals[0].token} — ${topSignals[0].direction}` : "Loading..."}
                </p>
              </div>
              {topSignals[0] && (
                <span className={`ml-auto pill-badge-orange text-[10px] ${
                  topSignals[0].direction === "BUY" ? "!bg-[rgba(34,197,94,.15)] !text-[#4ade80] !border-[rgba(34,197,94,.3)]" :
                  topSignals[0].direction === "SELL" ? "!bg-[rgba(239,68,68,.15)] !text-[#f87171] !border-[rgba(239,68,68,.3)]" :
                  ""
                }`}>
                  {topSignals[0].confidence}% conf
                </span>
              )}
            </div>
            {topSignals[0] && (
              <div className="flex items-center gap-4 text-xs text-[#A8A09A]">
                <span>Price: <span className="text-[#F5F0E8]">{topSignals[0].price}</span></span>
                <span>Target: <span className="text-[#4ade80]">{topSignals[0].target}</span></span>
                <span>SL: <span className="text-[#ef4444]">{topSignals[0].stopLoss}</span></span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="relative z-10 px-4 pb-20 md:pb-28">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xs uppercase tracking-[0.2em] text-[#A8A09A] mb-3 font-medium">Agent Skills</h2>
            <p className="text-2xl md:text-3xl font-bold text-[#F5F0E8]">
              6 Skills. <span className="orange-gradient-text">One Agent.</span>
            </p>
          </div>

          {/* Horizontal scrollable on mobile, grid on desktop */}
          <div className="horizontal-scroll lg:grid lg:grid-cols-3 lg:overflow-visible px-2">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="feature-card w-[280px] lg:w-auto animate-slide-up"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="feature-icon">{f.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[#F5F0E8] mb-1">{f.title}</h3>
                    <p className="text-xs text-[#A8A09A] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                  <span className="text-[10px] text-[#A8A09A]">Active</span>
                  <span className="pill-badge-orange text-[10px] py-0.5 px-2">
                    <span className="live-dot-orange" style={{ width: 5, height: 5 }} />
                    Live
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="section-divider" />
      </div>

      {/* ─── Live Preview Section ─── */}
      <section className="relative z-10 px-4 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xs uppercase tracking-[0.2em] text-[#A8A09A] mb-3 font-medium">Live Intelligence</h2>
            <p className="text-2xl md:text-3xl font-bold text-[#F5F0E8]">
              Real-time <span className="orange-gradient-text">Market Data</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Rankings */}
            <div className="gradient-border-card p-0 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📊</span>
                  <h3 className="text-sm font-semibold text-[#F5F0E8]">Top 5 by Market Cap</h3>
                </div>
                <a href="/dashboard" className="text-[10px] text-[#E8610A] hover:text-[#F5A020] transition-colors">
                  View All →
                </a>
              </div>
              <div className="overflow-x-auto">
                {dataLoading ? (
                  <div className="p-8 space-y-3">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-8 rounded-lg animate-shimmer" />
                    ))}
                  </div>
                ) : (
                  <table className="market-table">
                    <thead>
                      <tr>
                        <th className="w-10">#</th>
                        <th>Asset</th>
                        <th>Price</th>
                        <th>24h</th>
                        <th className="w-20">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topMarket.map((coin) => (
                        <tr key={coin.symbol}>
                          <td className="text-[#A8A09A] text-xs font-medium">{coin.rank}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#F5F0E8]">{coin.symbol}</span>
                              <span className="text-[#A8A09A] text-xs hidden sm:inline">{coin.name}</span>
                            </div>
                          </td>
                          <td className="font-medium text-[#F5F0E8]">{coin.price}</td>
                          <td>
                            <span className={coin.change24h >= 0 ? "text-[#4ade80] font-semibold" : "text-[#ef4444] font-semibold"}>
                              {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                            </span>
                          </td>
                          <td><ChangeBar value={coin.change24h} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Latest Signals */}
            <div className="gradient-border-card p-0 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📈</span>
                  <h3 className="text-sm font-semibold text-[#F5F0E8]">Trading Signals</h3>
                </div>
                <a href="/signals" className="text-[10px] text-[#E8610A] hover:text-[#F5A020] transition-colors">
                  View All →
                </a>
              </div>
              <div className="p-4 space-y-3">
                {dataLoading ? (
                  [1,2,3].map(i => (
                    <div key={i} className="h-20 rounded-xl animate-shimmer" />
                  ))
                ) : topSignals.length > 0 ? (
                  topSignals.map((sig) => (
                    <div
                      key={sig.id}
                      className={`p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] transition-all hover:border-white/[0.1] ${
                        sig.direction === "BUY" ? "signal-buy" : sig.direction === "SELL" ? "signal-sell" : "signal-hold"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#F5F0E8] text-sm">{sig.token}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            sig.direction === "BUY" ? "bg-[rgba(34,197,94,.15)] text-[#4ade80]" :
                            sig.direction === "SELL" ? "bg-[rgba(239,68,68,.15)] text-[#f87171]" :
                            "bg-[rgba(245,160,32,.15)] text-[#F5A020]"
                          }`}>
                            {sig.direction}
                          </span>
                        </div>
                        <span className="text-xs text-[#A8A09A]">{sig.confidence}%</span>
                      </div>
                      <div className="flex gap-4 text-[11px] text-[#A8A09A]">
                        <span>Entry: <span className="text-[#F5F0E8]">{sig.price}</span></span>
                        <span>Target: <span className="text-[#4ade80]">{sig.target}</span></span>
                        <span>SL: <span className="text-[#ef4444]">{sig.stopLoss}</span></span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-[#A8A09A] text-sm">No signals available</div>
                )}
              </div>
            </div>
          </div>

          {/* Trending Meme Tokens Strip */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-lg">🔥</span>
              <h3 className="text-sm font-semibold text-[#F5F0E8]">Trending Meme Tokens</h3>
            </div>
            <div className="horizontal-scroll pb-2">
              {dataLoading ? (
                [1,2,3,4,5,6].map(i => (
                  <div key={i} className="w-36 h-24 rounded-xl animate-shimmer flex-shrink-0" />
                ))
              ) : topMemes.length > 0 ? (
                topMemes.map((meme) => (
                  <div
                    key={meme.symbol}
                    className="w-36 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[rgba(232,97,10,0.3)] transition-all hover:shadow-[0_0_20px_rgba(232,97,10,0.1)] flex-shrink-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[#F5F0E8] text-xs">{meme.symbol}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium risk-${meme.risk.toLowerCase()}`}>
                        {meme.risk}
                      </span>
                    </div>
                    <p className="text-xs text-[#A8A09A] mb-1">{meme.price}</p>
                    <p className={`text-xs font-semibold ${meme.change24h >= 0 ? "text-[#4ade80]" : "text-[#ef4444]"}`}>
                      {meme.change24h >= 0 ? "+" : ""}{meme.change24h.toFixed(1)}%
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-[#A8A09A] text-sm">No meme data available</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="section-divider" />
      </div>

      {/* ─── Chat Section ─── */}
      <section ref={chatRef} id="chat" className="relative z-10 px-4 pt-16 pb-12 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[#A8A09A] mb-3 font-medium">AI Agent</h2>
          <p className="text-2xl md:text-3xl font-bold text-[#F5F0E8]">
            Talk to <span className="orange-gradient-text">CryptoSentry</span>
          </p>
        </div>
        <AgentChat />
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-white/[0.04] py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A8A09A]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center text-[#0E0804] font-bold text-[8px]" style={{ background: "linear-gradient(135deg, #E8610A, #F5A020)" }}>S</div>
            <span className="font-medium text-[#F5F0E8]">CryptoSentry</span>
          </div>
          <span>AI-Powered Crypto Intelligence · Data from CoinGecko</span>
        </div>
      </footer>
    </main>
  );
}
