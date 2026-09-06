"use client";

import { useEffect, useState } from "react";
import type { TokenInfo, AuditResult } from "@/lib/types";
import { formatPercent } from "@/lib/utils";

export default function TokensPage() {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [audit, setAudit] = useState<AuditResult | null>(null);

  useEffect(() => {
    fetch("/api/skills/tokens").then(r => r.json()).then(setTokens).catch(() => {});
  }, []);

  const runAudit = async (symbol: string) => {
    setSelected(symbol);
    const mod = await import("@/lib/skills/token-audit");
    const result = await mod.auditToken(symbol);
    setAudit(result);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 text-[#F5F0E8]">Token Explorer</h1>
        <p className="text-[#A8A09A] text-sm">Explore tokens and run security audits powered by Binance Skills Hub.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[#A8A09A]">
                  <th className="text-left px-4 py-3 font-medium">Token</th>
                  <th className="text-right px-4 py-3 font-medium">Price</th>
                  <th className="text-right px-4 py-3 font-medium">24h</th>
                  <th className="text-right px-4 py-3 font-medium">7d</th>
                  <th className="text-right px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token) => (
                  <tr
                    key={token.symbol}
                    className={`border-b border-white/[0.03] transition-colors cursor-pointer ${selected === token.symbol ? "bg-[rgba(232,97,10,0.08)]" : ""}`}
                    onClick={() => runAudit(token.symbol)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#0E0804]" style={{ background: "linear-gradient(135deg, #E8610A, #F5A020)" }}>
                          {token.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-[#F5F0E8]">{token.symbol}</div>
                          <div className="text-xs text-[#A8A09A]">{token.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[#F5F0E8]/80">{token.price}</td>
                    <td className={`px-4 py-3 text-right font-mono font-semibold ${token.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {formatPercent(token.change24h)}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-semibold ${token.change7d >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {formatPercent(token.change7d)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="orange-btn-outline text-xs !py-1 !px-3 !rounded-full">
                        Audit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          {audit ? (
            <div className="glass-card p-5 sticky top-20">
              <h3 className="text-lg font-bold mb-1 text-[#F5F0E8]">🛡️ Security Audit</h3>
              <p className="text-[#A8A09A] text-sm mb-4">{audit.token}</p>

              <div className="text-center mb-4">
                <div className={`text-5xl font-bold ${audit.score >= 80 ? "text-green-400" : audit.score >= 60 ? "text-[#F5A020]" : "text-red-400"}`}>
                  {audit.score}
                </div>
                <div className="text-xs text-[#A8A09A]">/ 100</div>
              </div>

              <div className="space-y-2 mb-4">
                {[
                  { label: "Contract Verified", value: audit.contractVerified },
                  { label: "Honeypot", value: !audit.honeypot },
                  { label: "Not Mintable", value: !audit.mintable },
                  { label: "Liquidity Locked", value: audit.liquidityLocked },
                ].map((check) => (
                  <div key={check.label} className="flex items-center justify-between text-sm">
                    <span className="text-[#A8A09A]">{check.label}</span>
                    <span>{check.value ? "✅" : "❌"}</span>
                  </div>
                ))}
              </div>

              <div className="mb-3">
                <h4 className="text-xs font-semibold text-red-400/80 mb-2 uppercase tracking-wider">Risks</h4>
                {audit.risks.map((r, i) => (
                  <div key={i} className="text-xs text-[#A8A09A] mb-1">⚠️ {r}</div>
                ))}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-green-400/80 mb-2 uppercase tracking-wider">Positives</h4>
                {audit.positives.map((p, i) => (
                  <div key={i} className="text-xs text-[#A8A09A] mb-1">✅ {p}</div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card p-5 text-center text-[#A8A09A] text-sm">
              Click on a token to run a security audit
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
