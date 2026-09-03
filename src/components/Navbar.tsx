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
    <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <span className="font-bold text-lg bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
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
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <span className="mr-1.5">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30 px-2 py-1 rounded border border-white/10">
              Binance Agent OS
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
