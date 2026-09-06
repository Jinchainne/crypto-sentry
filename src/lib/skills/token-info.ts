import type { TokenInfo } from "../types";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

const SYMBOL_TO_ID: Record<string, string> = {
  BTC: "bitcoin", ETH: "ethereum", BNB: "binancecoin", SOL: "solana",
  XRP: "ripple", DOGE: "dogecoin", ADA: "cardano", AVAX: "avalanche-2",
  USDT: "tether", PEPE: "pepe", WIF: "dogwifhat", BONK: "bonk", FLOKI: "floki",
};

function formatUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(8)}`;
}

function formatPrice(n: number): string {
  if (n >= 1) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(8)}`;
}

interface CoinGeckoDetail {
  id: string;
  symbol: string;
  name: string;
  market_data: {
    current_price: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    market_cap: { usd: number };
    total_volume: { usd: number };
  };
  categories: string[];
  description?: { en: string };
}

const cachedTokens: Record<string, TokenInfo> = {};
let cacheTime = 0;

function coinToTokenInfo(c: CoinGeckoDetail): TokenInfo {
  const md = c.market_data;
  const chain = c.categories?.[0] || "Unknown";
  return {
    symbol: c.symbol.toUpperCase(),
    name: c.name,
    price: formatPrice(md.current_price?.usd || 0),
    change24h: Math.round((md.price_change_percentage_24h || 0) * 100) / 100,
    change7d: Math.round((md.price_change_percentage_7d || 0) * 100) / 100,
    marketCap: formatUsd(md.market_cap?.usd || 0),
    volume24h: formatUsd(md.total_volume?.usd || 0),
    holders: 0,
    chain,
  };
}

export async function getTokenInfo(symbol: string): Promise<TokenInfo | null> {
  const normalized = symbol.toUpperCase();
  const coinId = SYMBOL_TO_ID[normalized];
  if (!coinId) return cachedTokens[normalized] || null;

  try {
    const res = await fetch(
      `${COINGECKO_API}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data: CoinGeckoDetail = await res.json();
    const info = coinToTokenInfo(data);
    cachedTokens[normalized] = info;
    cacheTime = Date.now();
    return info;
  } catch (err) {
    console.error(`[token-info] Error for ${symbol}:`, err);
    return cachedTokens[normalized] || null;
  }
}

export async function searchTokens(query: string): Promise<TokenInfo[]> {
  const q = query.toLowerCase();
  // Search CoinGecko search endpoint
  try {
    const res = await fetch(`${COINGECKO_API}/search?query=${encodeURIComponent(q)}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`CoinGecko search ${res.status}`);
    const data = await res.json();
    const coins = (data.coins || []).slice(0, 10);

    const results: TokenInfo[] = [];
    for (const coin of coins) {
      const info = await getTokenInfo(coin.symbol);
      if (info) results.push(info);
    }
    return results;
  } catch (err) {
    console.error("[token-info] Search error:", err);
    return Object.values(cachedTokens).filter(
      (t) => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
    );
  }
}

export async function getTopTokens(limit: number = 8): Promise<TokenInfo[]> {
  try {
    const res = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((c: any) => ({
      symbol: (c.symbol as string).toUpperCase(),
      name: c.name,
      price: formatPrice(c.current_price),
      change24h: Math.round((c.price_change_percentage_24h || 0) * 100) / 100,
      change7d: Math.round((c.price_change_percentage_7d_in_currency || 0) * 100) / 100,
      marketCap: formatUsd(c.market_cap),
      volume24h: formatUsd(c.total_volume),
      holders: 0,
      chain: "Multi",
    }));
  } catch (err) {
    console.error("[token-info] getTopTokens error:", err);
    return Object.values(cachedTokens).slice(0, limit);
  }
}
