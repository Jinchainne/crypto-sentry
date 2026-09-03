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
    <main className="max-w-7xl mx-auto px-4 py-6 mesh-gradient">
      <h1 className="text-2xl font-bold mb-2">Wallet Tracker</h1>
      <p className="text-white/40 text-sm mb-6">Track any wallet using the Binance Web3 wallet tracker skill.</p>

      {/* Search */}
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && trackWallet()}
          placeholder="Enter wallet address (0x...)"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50"
        />
        <button
          onClick={trackWallet}
          disabled={loading}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-black font-medium rounded-xl text-sm transition-all"
        >
          {loading ? "Tracking..." : "Track"}
        </button>
      </div>

      {/* Quick examples */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs text-white/30">Try:</span>
        {["0xd8da6bf26964af9d7eed9e03e53415d37aa96045", "0x28c6c06298d514db089934071355e5743bf21d60"].map((addr) => (
          <button
            key={addr}
            onClick={() => { setAddress(addr); }}
            className="text-xs px-3 py-1 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-amber-500/50 transition-all font-mono"
          >
            {shortenAddress(addr)}
          </button>
        ))}
      </div>

      {/* Result */}
      {wallet && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">{wallet.label || "Unknown Wallet"}</h2>
              <p className="text-xs text-white/40 font-mono">{wallet.address}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/40">{wallet.chain}</div>
              <div className="text-lg font-bold">{wallet.balance}</div>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-white/60 mb-3">Token Holdings</h3>
          <div className="space-y-2">
            {wallet.tokens.map((token) => (
              <div key={token.symbol} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <div>
                  <span className="font-bold">{token.symbol}</span>
                  <span className="text-white/40 ml-2 text-sm">{token.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-mono">{token.value}</div>
                  <div className={`text-xs font-mono ${token.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
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
