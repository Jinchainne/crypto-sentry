"use client";

import { useEffect, useState } from "react";
import type { TokenInfo, AuditResult } from "@/lib/types";
import { formatPercent } from "@/lib/utils";

export default function TokensPage() {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [audit, setAudit] = useState<AuditResult | null>(null);

  useEffect(() => {
    import("@/lib/skills/token-info").then(m => m.getTopTokens().then(setTokens));
  }, []);

  const runAudit = async (symbol: string) => {
    setSelected(symbol);
    const mod = await import("@/lib/skills/token-audit");
    const result = await mod.auditToken(symbol);
    setAudit(result);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 mesh-gradient">
      <h1 className="text-2xl font-bold mb-2">Token Explorer</h1>
      <p className="text-white/40 text-sm mb-6">Explore tokens and run security audits powered by Binance Skills Hub.</p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Token List */}
        <div className="md:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/40">
                  <th className="text-left px-4 py-3">Token</th>
                  <th className="text-right px-4 py-3">Price</th>
                  <th className="text-right px-4 py-3">24h</th>
                  <th className="text-right px-4 py-3">7d</th>
                  <th className="text-right px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token) => (
                  <tr
                    key={token.symbol}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${selected === token.symbol ? "bg-amber-500/10" : ""}`}
                    onClick={() => runAudit(token.symbol)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold">{token.symbol}</div>
                      <div className="text-xs text-white/40">{token.name}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{token.price}</td>
                    <td className={`px-4 py-3 text-right font-mono ${token.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {formatPercent(token.change24h)}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono ${token.change7d >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {formatPercent(token.change7d)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-xs px-3 py-1 rounded-full border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all">
                        Audit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Panel */}
        <div>
          {audit ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 sticky top-20">
              <h3 className="text-lg font-bold mb-1">🛡️ Security Audit</h3>
              <p className="text-white/40 text-sm mb-4">{audit.token}</p>

              <div className="text-center mb-4">
                <div className={`text-5xl font-bold ${audit.score >= 80 ? "text-green-400" : audit.score >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                  {audit.score}
                </div>
                <div className="text-xs text-white/40">/ 100</div>
              </div>

              <div className="space-y-2 mb-4">
                {[
                  { label: "Contract Verified", value: audit.contractVerified },
                  { label: "Honeypot", value: !audit.honeypot },
                  { label: "Not Mintable", value: !audit.mintable },
                  { label: "Liquidity Locked", value: audit.liquidityLocked },
                ].map((check) => (
                  <div key={check.label} className="flex items-center justify-between text-sm">
                    <span className="text-white/60">{check.label}</span>
                    <span>{check.value ? "✅" : "❌"}</span>
                  </div>
                ))}
              </div>

              <div className="mb-3">
                <h4 className="text-xs font-semibold text-red-400/80 mb-2">RISKS</h4>
                {audit.risks.map((r, i) => (
                  <div key={i} className="text-xs text-white/50 mb-1">⚠️ {r}</div>
                ))}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-green-400/80 mb-2">POSITIVES</h4>
                {audit.positives.map((p, i) => (
                  <div key={i} className="text-xs text-white/50 mb-1">✅ {p}</div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center text-white/30 text-sm">
              Click on a token to run a security audit
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
