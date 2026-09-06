import type { MemeToken } from "../types";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

// Known meme coin IDs on CoinGecko
const MEME_COIN_IDS = [
  "pepe", "dogwifhat", "bonk", "floki", "dogecoin", "shiba-inu",
  "baby-doge-coin", "dogelon-mars", "brett", "mog-coin", "turbo",
  "neiro", "giga-chad", "popcat", "book-of-meme",
];

function formatPrice(n: number): string {
  if (n >= 1) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(8)}`;
}

function formatUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function riskLevel(change24h: number, marketCap: number): "LOW" | "MEDIUM" | "HIGH" | "EXTREME" {
  if (marketCap < 50_000_000) return "EXTREME";
  if (marketCap < 200_000_000 || Math.abs(change24h) > 30) return "HIGH";
  if (marketCap < 1_000_000_000 || Math.abs(change24h) > 15) return "MEDIUM";
  return "LOW";
}

function tokenAge(athDate: string | null): string {
  if (!athDate) return "Unknown";
  const diff = Date.now() - new Date(athDate).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.floor(days / 30)}m`;
  return `${Math.floor(days / 365)}y`;
}

interface CoinGeckoMarketItem {
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h?: number;
  total_volume: number;
  market_cap: number;
  ath_date?: string;
}

let cachedMemes: MemeToken[] | null = null;

export async function getMemeRush(limit: number = 8): Promise<MemeToken[]> {
  try {
    const res = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${MEME_COIN_IDS.join(",")}&order=market_cap_desc&per_page=50&page=1&sparkline=false`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data: CoinGeckoMarketItem[] = await res.json();

    const memes: MemeToken[] = data.slice(0, limit).map((c) => {
      const change1h = Math.round((c.price_change_percentage_1h_in_currency || 0) * 100) / 100;
      const change24h = Math.round((c.price_change_percentage_24h || 0) * 100) / 100;
      return {
        symbol: c.symbol.toUpperCase(),
        name: c.name,
        price: formatPrice(c.current_price),
        change1h,
        change24h,
        volume: formatUsd(c.total_volume),
        liquidity: formatUsd(c.market_cap * 0.15), // Approximate: 15% of mcap
        age: tokenAge(c.ath_date || null),
        risk: riskLevel(change24h, c.market_cap),
      };
    });

    cachedMemes = memes;
    return memes;
  } catch (err) {
    console.error("[meme-rush] CoinGecko error:", err);
    if (cachedMemes) return cachedMemes.slice(0, limit);
    return [
      { symbol: "PEPE", name: "Pepe", price: "—", change1h: 0, change24h: 0, volume: "—", liquidity: "—", age: "—", risk: "HIGH" },
    ];
  }
}
