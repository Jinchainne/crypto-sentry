"use client";

import { useState } from "react";
import type { WalletInfo } from "@/lib/types";
import { shortenAddress, formatPercent } from "@/lib/utils";

export default function WalletsPage() {
  const [address, setAddress] = useState("");
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const trackWallet = async () => {
    if (!address.trim()) return;
    setLoading(true);
    try {
      const mod = await import("@/lib/skills/wallet-tracker");
      const result = await mod.trackWallet(address.trim());
      setWallet(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 text-[#F5F0E8]">Wallet Tracker</h1>
        <p className="text-[#A8A09A] text-sm">Track any wallet using the Binance Web3 wallet tracker skill.</p>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && trackWallet()}
          placeholder="Enter wallet address (0x...)"
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#F5F0E8] placeholder:text-[#A8A09A]/50 focus:outline-none focus:border-[rgba(232,97,10,0.4)]"
        />
        <button onClick={trackWallet} disabled={loading} className="orange-btn text-sm !rounded-xl">
          {loading ? "Tracking..." : "Track"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs text-[#A8A09A]">Try:</span>
        {["0xd8da6bf26964af9d7eed9e03e53415d37aa96045", "0x28c6c06298d514db089934071355e5743bf21d60"].map((addr) => (
          <button key={addr} onClick={() => setAddress(addr)} className="pill-badge hover:text-[#E8610A] hover:border-[rgba(232,97,10,0.3)] transition-all cursor-pointer font-mono">
            {shortenAddress(addr)}
          </button>
        ))}
      </div>

      {wallet && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-[#F5F0E8]">{wallet.label || "Unknown Wallet"}</h2>
              <p className="text-xs text-[#A8A09A] font-mono">{wallet.address}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-[#A8A09A]">{wallet.chain}</div>
              <div className="text-lg font-bold text-[#F5F0E8]">{wallet.balance}</div>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-[#A8A09A] mb-3">Token Holdings</h3>
          <div className="space-y-2">
            {wallet.tokens.map((token) => (
              <div key={token.symbol} className="flex items-center justify-between bg-white/[0.03] rounded-lg p-3 border border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#0E0804]" style={{ background: "linear-gradient(135deg, #E8610A, #F5A020)" }}>
                    {token.symbol.slice(0, 2)}
                  </div>
                  <span className="font-bold text-[#F5F0E8]">{token.symbol}</span>
                  <span className="text-[#A8A09A] text-sm">{token.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[#F5F0E8]">{token.value}</div>
                  <div className={`text-xs font-mono font-semibold ${token.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {formatPercent(token.change24h)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
