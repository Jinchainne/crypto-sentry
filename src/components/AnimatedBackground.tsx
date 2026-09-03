"use client";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Orb 1 — top-left (very visible) */}
      <div
        className="absolute -top-40 -left-40 w-[900px] h-[900px] rounded-full animate-orb-1"
        style={{ background: "radial-gradient(circle, #E8610A 0%, #E8610A 20%, rgba(232,97,10,0.3) 50%, transparent 70%)", mixBlendMode: "screen" }}
      />
      {/* Orb 2 — bottom-right */}
      <div
        className="absolute -bottom-20 -right-20 w-[800px] h-[800px] rounded-full animate-orb-2"
        style={{ background: "radial-gradient(circle, #F5A020 0%, #F5A020 15%, rgba(245,160,32,0.25) 45%, transparent 70%)", mixBlendMode: "screen" }}
      />
      {/* Orb 3 — center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] rounded-full animate-orb-3"
        style={{ background: "radial-gradient(circle, #E8610A 0%, rgba(232,97,10,0.4) 30%, transparent 65%)", mixBlendMode: "screen" }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48"
        style={{ background: "linear-gradient(to top, #0A0502 0%, transparent 100%)" }}
      />
    </div>
  );
}
