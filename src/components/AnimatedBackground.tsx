"use client";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Orb 1 — top-left (very prominent) */}
      <div
        className="absolute -top-40 -left-40 w-[900px] h-[900px] rounded-full animate-orb-1"
        style={{ background: "radial-gradient(circle, rgba(232,97,10,0.35) 0%, rgba(232,97,10,0.1) 40%, transparent 70%)" }}
      />
      {/* Orb 2 — bottom-right */}
      <div
        className="absolute -bottom-20 -right-20 w-[800px] h-[800px] rounded-full animate-orb-2"
        style={{ background: "radial-gradient(circle, rgba(245,160,32,0.3) 0%, rgba(245,160,32,0.08) 40%, transparent 70%)" }}
      />
      {/* Orb 3 — center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] rounded-full animate-orb-3"
        style={{ background: "radial-gradient(circle, rgba(232,97,10,0.2) 0%, rgba(232,97,10,0.05) 40%, transparent 65%)" }}
      />
      {/* Top-left warm glow */}
      <div
        className="absolute top-0 left-0 w-[500px] h-[500px]"
        style={{ background: "radial-gradient(circle at 30% 30%, rgba(232,97,10,0.12) 0%, transparent 60%)" }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48"
        style={{ background: "linear-gradient(to top, rgba(10,5,2,0.9) 0%, transparent 100%)" }}
      />
    </div>
  );
}
