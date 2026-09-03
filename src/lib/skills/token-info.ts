import type { TokenInfo } from "../types";

const DEMO_TOKENS: Record<string, TokenInfo> = {
  BTC: { symbol: "BTC", name: "Bitcoin", price: "$65,234.50", change24h: 1.56, change7d: 4.23, marketCap: "$1,280B", volume24h: "$28.5B", holders: 52000000, chain: "Bitcoin" },
  ETH: { symbol: "ETH", name: "Ethereum", price: "$3,118.50", change24h: 2.34, change7d: 5.67, marketCap: "$375B", volume24h: "$15.2B", holders: 28000000, chain: "Ethereum" },
  BNB: { symbol: "BNB", name: "BNB", price: "$600.00", change24h: -1.23, change7d: 3.45, marketCap: "$90B", volume24h: "$2.1B", holders: 4500000, chain: "BNB Chain" },
  SOL: { symbol: "SOL", name: "Solana", price: "$178.90", change24h: 5.67, change7d: 12.34, marketCap: "$78B", volume24h: "$4.5B", holders: 8200000, chain: "Solana" },
  XRP: { symbol: "XRP", name: "XRP", price: "$0.6234", change24h: -0.45, change7d: 2.11, marketCap: "$34B", volume24h: "$1.8B", holders: 5100000, chain: "XRP Ledger" },
  DOGE: { symbol: "DOGE", name: "Dogecoin", price: "$0.1567", change24h: 8.90, change7d: 15.23, marketCap: "$22B", volume24h: "$2.3B", holders: 6700000, chain: "Dogecoin", auditScore: 85 },
  PEPE: { symbol: "PEPE", name: "Pepe", price: "$0.00001234", change24h: 15.67, change7d: 45.23, marketCap: "$5.2B", volume24h: "$1.5B", holders: 280000, chain: "Ethereum", auditScore: 62 },
  WIF: { symbol: "WIF", name: "dogwifhat", price: "$2.45", change24h: -3.21, change7d: 8.90, marketCap: "$2.4B", volume24h: "$800M", holders: 150000, chain: "Solana", auditScore: 71 },
};

export async function getTokenInfo(symbol: string): Promise<TokenInfo | null> {
  const normalized = symbol.toUpperCase();
  return DEMO_TOKENS[normalized] || null;
}

export async function searchTokens(query: string): Promise<TokenInfo[]> {
  const q = query.toLowerCase();
  return Object.values(DEMO_TOKENS).filter(
    (t) => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
  );
}

export async function getTopTokens(limit: number = 8): Promise<TokenInfo[]> {
  return Object.values(DEMO_TOKENS).slice(0, limit);
}
