import type { MarketRankItem } from "../types";

const DEMO_MARKET: MarketRankItem[] = [
  { rank: 1, symbol: "BTC", name: "Bitcoin", price: "$65,234.50", change24h: 1.56, volume24h: "$28.5B", marketCap: "$1,280B" },
  { rank: 2, symbol: "ETH", name: "Ethereum", price: "$3,118.50", change24h: 2.34, volume24h: "$15.2B", marketCap: "$375B" },
  { rank: 3, symbol: "BNB", name: "BNB", price: "$600.00", change24h: -1.23, volume24h: "$2.1B", marketCap: "$90B" },
  { rank: 4, symbol: "SOL", name: "Solana", price: "$178.90", change24h: 5.67, volume24h: "$4.5B", marketCap: "$78B" },
  { rank: 5, symbol: "XRP", name: "XRP", price: "$0.6234", change24h: -0.45, volume24h: "$1.8B", marketCap: "$34B" },
  { rank: 6, symbol: "DOGE", name: "Dogecoin", price: "$0.1567", change24h: 8.90, volume24h: "$2.3B", marketCap: "$22B" },
  { rank: 7, symbol: "ADA", name: "Cardano", price: "$0.4523", change24h: 1.12, volume24h: "$890M", marketCap: "$16B" },
  { rank: 8, symbol: "AVAX", name: "Avalanche", price: "$35.67", change24h: 3.45, volume24h: "$650M", marketCap: "$13B" },
];

export async function getMarketRank(limit: number = 8): Promise<MarketRankItem[]> {
  return DEMO_MARKET.slice(0, limit);
}
