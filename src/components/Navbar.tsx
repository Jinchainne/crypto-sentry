"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Agent", icon: "🤖" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/signals", label: "Signals", icon: "📈" },
  { href: "/wallets", label: "Wallets", icon: "🐋" },
  { href: "/tokens", label: "Tokens", icon: "🪙" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-white/[0.08] bg-[#0E0804]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0E0804] font-bold text-sm animate-glow-pulse" style={{ background: "linear-gradient(135deg, #E8610A, #F5A020)" }}>
              S
            </div>
            <span className="font-bold text-lg orange-gradient-text">
              CryptoSentry
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-[rgba(232,97,10,0.15)] text-[#E8610A] border border-[rgba(232,97,10,0.3)]"
                      : "text-[#A8A09A] hover:text-[#F5F0E8] hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="live-dot" />
              <span className="text-xs text-[#E8610A]">Live</span>
            </div>
            <span className="pill-badge-orange text-[10px]">
              Agent OS
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
