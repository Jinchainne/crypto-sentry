import type { AuditResult } from "../types";

const DEMO_AUDITS: Record<string, AuditResult> = {
  PEPE: {
    token: "PEPE",
    score: 62,
    risks: ["Low liquidity depth", "High whale concentration (top 10 hold 45%)", "No timelock on contract"],
    positives: ["Contract verified", "No mint function", "Renounced ownership", "Active community"],
    contractVerified: true,
    honeypot: false,
    mintable: false,
    proxyContract: false,
    liquidityLocked: true,
  },
  WIF: {
    token: "WIF",
    score: 71,
    risks: ["Relatively new token (< 1 year)", "Moderate whale concentration"],
    positives: ["Contract verified", "Strong liquidity", "No hidden fees", "Active development"],
    contractVerified: true,
    honeypot: false,
    mintable: false,
    proxyContract: false,
    liquidityLocked: true,
  },
  DOGE: {
    token: "DOGE",
    score: 85,
    risks: ["Inflationary supply model", "Meme-driven volatility"],
    positives: ["Established since 2013", "Massive community", "Listed on all major exchanges", "High liquidity"],
    contractVerified: true,
    honeypot: false,
    mintable: false,
    proxyContract: false,
    liquidityLocked: true,
  },
};

export async function auditToken(symbol: string): Promise<AuditResult | null> {
  const normalized = symbol.toUpperCase();
  if (DEMO_AUDITS[normalized]) return DEMO_AUDITS[normalized];
  
  // Generate generic audit for unknown tokens
  return {
    token: normalized,
    score: 50,
    risks: ["Unknown token - limited data available", "Cannot verify contract source"],
    positives: ["Token exists on-chain"],
    contractVerified: false,
    honeypot: false,
    mintable: true,
    proxyContract: false,
    liquidityLocked: false,
  };
}
