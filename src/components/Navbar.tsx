"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PRIMARY_LINKS = [
  { label: "Agent", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Signals", href: "/signals" },
  { label: "Wallets", href: "/wallets" },
  { label: "Tokens", href: "/tokens" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-3">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <div
          className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-[#0E0804] font-bold text-lg animate-nav-flower"
          style={{ background: "linear-gradient(135deg, #E8610A, #F5A020)" }}
        >
          S
        </div>
        <span className="font-bold text-lg md:text-xl tracking-tight">
          <span className="text-[#F5F0E8]">Crypto</span>
          <span className="text-[#E8610A]">Sentry</span>
        </span>
      </Link>

      {/* Center pill nav — frosted glass */}
      <div
        className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-0.5 rounded-full px-1.5 py-1 border border-white/10 backdrop-blur-xl"
        style={{
          background: "rgba(14, 8, 4, 0.55)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {PRIMARY_LINKS.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-[rgba(232,97,10,0.15)] text-[#E8610A] border border-[rgba(232,97,10,0.3)]"
                  : "text-[#A8A09A] hover:text-[#F5F0E8] hover:bg-white/5"
              }`}
            >
              {active ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8610A]" />
                  {link.label}
                </span>
              ) : (
                link.label
              )}
            </Link>
          );
        })}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="live-dot" />
          <span className="text-xs text-[#E8610A] font-medium">Live</span>
        </div>
        <span className="pill-badge-orange text-[10px]">Agent OS</span>
      </div>
    </nav>
  );
}
