import type { TradingSignal } from "../types";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

interface CoinGeckoTicker {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  market_cap: number;
}

const COIN_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  SOL: "solana",
  XRP: "ripple",
  DOGE: "dogecoin",
  ADA: "cardano",
  AVAX: "avalanche-2",
};

function formatPrice(n: number): string {
  if (n >= 1) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(8)}`;
}

/** Approximate RSI from 24h change */
function approxRSI(change24h: number): number {
  return Math.max(10, Math.min(90, 50 + change24h * 3));
}

function generateSignal(coin: CoinGeckoTicker, index: number): TradingSignal {
  const token = coin.symbol.toUpperCase();
  const price = coin.current_price;
  const change = coin.price_change_percentage_24h || 0;
  const volume = coin.total_volume;
  const high = coin.high_24h;
  const low = coin.low_24h;
  const rsi = approxRSI(change);

  let direction: "BUY" | "SELL" | "HOLD";
  let confidence: number;
  let reasoning: string;

  if (rsi < 35 && change < -5) {
    direction = "BUY";
    confidence = Math.min(95, 70 + Math.abs(change));
    reasoning = `Oversold (RSI≈${Math.round(rsi)}). 24h drop of ${change.toFixed(1)}% suggests capitulation. Volume: $${(volume / 1e9).toFixed(1)}B. Potential entry near support at ${formatPrice(low)}.`;
  } else if (rsi > 70 && change > 5) {
    direction = "SELL";
    confidence = Math.min(95, 65 + change);
    reasoning = `Overbought (RSI≈${Math.round(rsi)}). 24h gain of ${change.toFixed(1)}% may be extended. High of ${formatPrice(high)} reached. Consider taking profits.`;
  } else if (Math.abs(change) < 2) {
    direction = "HOLD";
    confidence = 55 + Math.min(100, Math.log10(volume + 1) * 5) * 0.3;
    reasoning = `Consolidating (${change > 0 ? "+" : ""}${change.toFixed(1)}%). RSI≈${Math.round(rsi)} (neutral). Range: ${formatPrice(low)} - ${formatPrice(high)}. Volume: $${(volume / 1e9).toFixed(1)}B.`;
  } else if (change > 0) {
    direction = "BUY";
    confidence = 55 + change * 2;
    reasoning = `Bullish momentum (+${change.toFixed(1)}%). RSI≈${Math.round(rsi)} showing strength. Volume: $${(volume / 1e9).toFixed(1)}B. Watch for continuation above ${formatPrice(high)}.`;
  } else {
    direction = "HOLD";
    confidence = 50 + Math.abs(change) * 1.5;
    reasoning = `Mild weakness (${change.toFixed(1)}%). RSI≈${Math.round(rsi)}. Monitor for support at ${formatPrice(low)}.`;
  }

  confidence = Math.round(Math.min(95, Math.max(30, confidence)));

  const targetMultiplier = direction === "BUY" ? 1.08 : direction === "SELL" ? 0.92 : 1.0;
  const stopMultiplier = direction === "BUY" ? 0.95 : direction === "SELL" ? 1.05 : 1.0;

  return {
    id: `sig-${Date.now()}-${index}`,
    token,
    direction,
    confidence,
    price: formatPrice(price),
    target: formatPrice(price * targetMultiplier),
    stopLoss: formatPrice(price * stopMultiplier),
    reasoning,
    timestamp: new Date().toISOString(),
    source: "CoinGecko Market Data + RSI Analysis",
  };
}

let cachedSignals: TradingSignal[] | null = null;

export async function getSignals(limit: number = 10): Promise<TradingSignal[]> {
  try {
    const ids = Object.values(COIN_IDS).join(",");
    const res = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=7d`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const coins: CoinGeckoTicker[] = await res.json();

    const signals = coins.map((c, i) => generateSignal(c, i));
    cachedSignals = signals;
    return signals;
  } catch (err) {
    console.error("[trading-signal] CoinGecko error:", err);
    if (cachedSignals) return cachedSignals.slice(0, limit);
    return [];
  }
}

export async function getSignalForToken(token: string): Promise<TradingSignal | null> {
  const normalized = token.toUpperCase();
  const coinId = COIN_IDS[normalized];

  if (!coinId) {
    // Try fetching by symbol from CoinGecko search
    try {
      const searchRes = await fetch(`${COINGECKO_API}/search?query=${normalized}`, { next: { revalidate: 300 } });
      const searchData = await searchRes.json();
      const match = searchData.coins?.find((c: { symbol: string }) => c.symbol.toUpperCase() === normalized);
      if (!match) return null;

      const coinRes = await fetch(`${COINGECKO_API}/coins/${match.id}`, { next: { revalidate: 60 } });
      if (!coinRes.ok) return null;
      const coin = await coinRes.json();
      return generateSignal({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        current_price: coin.market_data.current_price.usd,
        price_change_percentage_24h: coin.market_data.price_change_percentage_24h,
        total_volume: coin.market_data.total_volume.usd,
        high_24h: coin.market_data.high_24h.usd,
        low_24h: coin.market_data.low_24h.usd,
        market_cap: coin.market_data.market_cap.usd,
      }, 0);
    } catch {
      return null;
    }
  }

  try {
    const res = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${coinId}&sparkline=false`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const coins: CoinGeckoTicker[] = await res.json();
    return coins.length > 0 ? generateSignal(coins[0], 0) : null;
  } catch (err) {
    console.error(`[trading-signal] Error for ${token}:`, err);
    if (cachedSignals) {
      return cachedSignals.find((s) => s.token.toUpperCase() === normalized) || null;
    }
    return null;
  }
}
