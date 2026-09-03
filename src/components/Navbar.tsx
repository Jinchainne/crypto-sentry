"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
    <nav className="border-b border-amber-500/20 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold text-sm shadow-lg shadow-amber-500/20">
              S
            </div>
            <span className="font-bold text-lg text-gradient-amber">
              CryptoSentry
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  pathname === item.href
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <span className="mr-1.5">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="status-dot" />
              <span className="text-xs text-green-400/80">Live</span>
            </div>
            <span className="text-xs text-amber-400/60 px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/5">
              Agent OS
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
