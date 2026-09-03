import type { MemeToken } from "../types";

const DEMO_MEMES: MemeToken[] = [
  { symbol: "PEPE", name: "Pepe", price: "$0.00001234", change1h: 2.34, change24h: 15.67, volume: "$1.5B", liquidity: "$450M", age: "2y", risk: "MEDIUM" },
  { symbol: "WIF", name: "dogwifhat", price: "$2.45", change1h: -1.23, change24h: -3.21, volume: "$800M", liquidity: "$320M", age: "8m", risk: "MEDIUM" },
  { symbol: "BONK", name: "Bonk", price: "$0.00002345", change1h: 5.67, change24h: 23.45, volume: "$650M", liquidity: "$180M", age: "1y", risk: "MEDIUM" },
  { symbol: "FLOKI", name: "FLOKI", price: "$0.0001789", change1h: 1.12, change24h: 8.90, volume: "$420M", liquidity: "$95M", age: "2y", risk: "LOW" },
  { symbol: "MOG", name: "Mog Coin", price: "$0.00000123", change1h: 12.34, change24h: 45.67, volume: "$180M", liquidity: "$25M", age: "6m", risk: "HIGH" },
  { symbol: "TURBO", name: "Turbo", price: "$0.0089", change1h: -3.45, change24h: -8.90, volume: "$95M", liquidity: "$15M", age: "4m", risk: "HIGH" },
  { symbol: "NEIRO", name: "Neiro", price: "$0.00156", change1h: 8.90, change24h: 67.89, volume: "$320M", liquidity: "$42M", age: "2m", risk: "EXTREME" },
  { symbol: "GIGA", name: "Giga Chad", price: "$0.0456", change1h: 4.56, change24h: 12.34, volume: "$75M", liquidity: "$18M", age: "5m", risk: "HIGH" },
];

export async function getMemeRush(limit: number = 8): Promise<MemeToken[]> {
  return DEMO_MEMES.slice(0, limit);
}
