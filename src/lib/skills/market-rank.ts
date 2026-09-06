import type { MarketRankItem } from "../types";

const COINGECKO_API = "https://api.coingecko.com/api/v3";
const COIN_ID_MAP: Record<string, string> = {
  BTC: "bitcoin", ETH: "ethereum", BNB: "binancecoin", SOL: "solana",
  XRP: "ripple", DOGE: "dogecoin", ADA: "cardano", AVAX: "avalanche-2",
};

function formatUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  if (n >= 1) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(8)}`;
}

function formatPrice(n: number): string {
  if (n >= 1) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(8)}`;
}

interface CoinGeckoMarketItem {
  market_cap_rank: number;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
}

let cachedData: MarketRankItem[] | null = null;
let cacheTime = 0;

export async function getMarketRank(limit: number = 8): Promise<MarketRankItem[]> {
  try {
    const res = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${Math.min(limit * 2, 100)}&page=1&sparkline=false`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data: CoinGeckoMarketItem[] = await res.json();

    const items: MarketRankItem[] = data.slice(0, limit).map((c) => ({
      rank: c.market_cap_rank,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      price: formatPrice(c.current_price),
      change24h: Math.round((c.price_change_percentage_24h || 0) * 100) / 100,
      volume24h: formatUsd(c.total_volume),
      marketCap: formatUsd(c.market_cap),
    }));

    cachedData = items;
    cacheTime = Date.now();
    return items;
  } catch (err) {
    console.error("[market-rank] CoinGecko error:", err);
    if (cachedData) return cachedData.slice(0, limit);
    // Hard fallback
    return [
      { rank: 1, symbol: "BTC", name: "Bitcoin", price: "—", change24h: 0, volume24h: "—", marketCap: "—" },
    ];
  }
}
