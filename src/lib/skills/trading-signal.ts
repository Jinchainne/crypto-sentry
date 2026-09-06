import type { TradingSignal } from "../types";

const BINANCE_API = "https://api.binance.com/api/v3";

interface BinanceTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  lastPrice: string;
  volume: string;
  quoteVolume: string;
  highPrice: string;
  lowPrice: string;
  count: number;
}

const WATCHLIST = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT", "DOGEUSDT", "ADAUSDT", "AVAXUSDT"];
const SYMBOL_NAME: Record<string, string> = {
  BTCUSDT: "BTC", ETHUSDT: "ETH", BNBUSDT: "BNB", SOLUSDT: "SOL",
  XRPUSDT: "XRP", DOGEUSDT: "DOGE", ADAUSDT: "ADA", AVAXUSDT: "AVAX",
};

function formatPrice(n: number): string {
  if (n >= 1) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(8)}`;
}

/** Approximate RSI from 24h change (simplified heuristic) */
function approxRSI(change24h: number): number {
  // Map change to RSI: -10% -> ~30, 0% -> ~50, +10% -> ~70
  return Math.max(10, Math.min(90, 50 + change24h * 3));
}

/** Generate trading signal from real market data */
function generateSignal(ticker: BinanceTicker, index: number): TradingSignal {
  const token = SYMBOL_NAME[ticker.symbol] || ticker.symbol.replace("USDT", "");
  const price = parseFloat(ticker.lastPrice);
  const change = parseFloat(ticker.priceChangePercent);
  const volume = parseFloat(ticker.quoteVolume);
  const high = parseFloat(ticker.highPrice);
  const low = parseFloat(ticker.lowPrice);
  const rsi = approxRSI(change);

  // Volume momentum: high trade count = active market
  const tradeCount = ticker.count;
  const volumeScore = Math.min(100, Math.log10(tradeCount + 1) * 15);

  let direction: "BUY" | "SELL" | "HOLD";
  let confidence: number;
  let reasoning: string;

  if (rsi < 35 && change < -5) {
    direction = "BUY";
    confidence = Math.min(95, 70 + Math.abs(change));
    reasoning = `Oversold (RSI≈${Math.round(rsi)}). 24h drop of ${change.toFixed(1)}% with ${tradeCount.toLocaleString()} trades suggests capitulation. Volume: $${(volume / 1e9).toFixed(1)}B. Potential mean-reversion entry near support at ${formatPrice(low)}.`;
  } else if (rsi > 70 && change > 5) {
    direction = "SELL";
    confidence = Math.min(95, 65 + change);
    reasoning = `Overbought (RSI≈${Math.round(rsi)}). 24h gain of ${change.toFixed(1)}% may be extended. High of ${formatPrice(high)} reached. ${tradeCount.toLocaleString()} trades indicate peak interest. Consider taking profits.`;
  } else if (Math.abs(change) < 2) {
    direction = "HOLD";
    confidence = 55 + volumeScore * 0.3;
    reasoning = `Consolidating with ${change > 0 ? "+" : ""}${change.toFixed(1)}% change. RSI≈${Math.round(rsi)} (neutral). Range: ${formatPrice(low)} - ${formatPrice(high)}. Waiting for directional breakout. Volume: $${(volume / 1e9).toFixed(1)}B.`;
  } else if (change > 0) {
    direction = "BUY";
    confidence = 55 + change * 2;
    reasoning = `Bullish momentum (+${change.toFixed(1)}%). RSI≈${Math.round(rsi)} showing strength but not overbought. ${tradeCount.toLocaleString()} trades supporting the move. Watch for continuation above ${formatPrice(high)}.`;
  } else {
    direction = "HOLD";
    confidence = 50 + Math.abs(change) * 1.5;
    reasoning = `Mild weakness (${change.toFixed(1)}%). RSI≈${Math.round(rsi)}. Not oversold enough for entry. Monitor for support at ${formatPrice(low)} before considering a position.`;
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
    source: "Binance 24h Stats + RSI Analysis",
  };
}

let cachedSignals: TradingSignal[] | null = null;

export async function getSignals(limit: number = 10): Promise<TradingSignal[]> {
  try {
    const tickers: BinanceTicker[] = await Promise.all(
      WATCHLIST.map(async (sym) => {
        const res = await fetch(`${BINANCE_API}/ticker/24hr?symbol=${sym}`, { next: { revalidate: 60 } });
        if (!res.ok) throw new Error(`Binance ${res.status} for ${sym}`);
        return res.json();
      })
    );

    const signals = tickers.map((t, i) => generateSignal(t, i)).slice(0, limit);
    cachedSignals = signals;
    return signals;
  } catch (err) {
    console.error("[trading-signal] Binance error:", err);
    if (cachedSignals) return cachedSignals.slice(0, limit);
    return [];
  }
}

export async function getSignalForToken(token: string): Promise<TradingSignal | null> {
  const normalized = token.toUpperCase();
  const binanceSymbol = `${normalized}USDT`;

  try {
    const res = await fetch(`${BINANCE_API}/ticker/24hr?symbol=${binanceSymbol}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`Binance ${res.status}`);
    const ticker: BinanceTicker = await res.json();
    return generateSignal(ticker, 0);
  } catch (err) {
    console.error(`[trading-signal] Error for ${token}:`, err);
    // Try cached signals
    if (cachedSignals) {
      return cachedSignals.find((s) => s.token.toUpperCase() === normalized) || null;
    }
    return null;
  }
}
