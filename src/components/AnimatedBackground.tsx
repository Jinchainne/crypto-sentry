"use client";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Orb 1 — top-left */}
      <div
        className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full animate-orb-1"
        style={{ background: "radial-gradient(circle, #E8610A 0%, transparent 70%)" }}
      />
      {/* Orb 2 — bottom-right */}
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full animate-orb-2"
        style={{ background: "radial-gradient(circle, #F5A020 0%, transparent 70%)" }}
      />
      {/* Orb 3 — center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full animate-orb-3"
        style={{ background: "radial-gradient(circle, #E8610A 0%, transparent 65%)" }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-64"
        style={{ background: "linear-gradient(to top, #0A0502 0%, transparent 100%)" }}
      />
    </div>
  );
}
