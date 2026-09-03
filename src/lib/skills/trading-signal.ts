import type { TradingSignal } from "../types";

const DEMO_SIGNALS: TradingSignal[] = [
  {
    id: "sig-001",
    token: "ETH",
    direction: "BUY",
    confidence: 87,
    price: "$3,118.50",
    target: "$3,450.00",
    stopLoss: "$2,950.00",
    reasoning: "Strong ETF inflows (+$180M this week), ETH/BTC ratio recovering, Shanghai upgrade momentum. RSI at 58 showing room for upside. Whale accumulation detected on-chain.",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    source: "Binance Trading Signal + Wallet Tracker",
  },
  {
    id: "sig-002",
    token: "SOL",
    direction: "BUY",
    confidence: 82,
    price: "$178.90",
    target: "$210.00",
    stopLoss: "$165.00",
    reasoning: "Solana DEX volume hitting ATH, meme coin activity driving fees. TVL growing 15% weekly. Breakout above key resistance at $175 confirmed with volume.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    source: "Binance Trading Signal + Market Rank",
  },
  {
    id: "sig-003",
    token: "BNB",
    direction: "HOLD",
    confidence: 65,
    price: "$600.00",
    target: "$650.00",
    stopLoss: "$560.00",
    reasoning: "Consolidating in $580-$620 range. BNB Chain TVL stable. Waiting for catalyst. Burn rate on track but no immediate price driver.",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    source: "Binance Trading Signal",
  },
  {
    id: "sig-004",
    token: "DOGE",
    direction: "SELL",
    confidence: 73,
    price: "$0.1567",
    target: "$0.1200",
    stopLoss: "$0.1750",
    reasoning: "Overbought on 4H RSI (78). Social sentiment peaked - historically a reversal signal. Whale wallets distributing. Meme coin rotation likely to newer narratives.",
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    source: "Binance Trading Signal + Meme Rush",
  },
];

export async function getSignals(limit: number = 10): Promise<TradingSignal[]> {
  return DEMO_SIGNALS.slice(0, limit);
}

export async function getSignalForToken(token: string): Promise<TradingSignal | null> {
  return DEMO_SIGNALS.find((s) => s.token.toUpperCase() === token.toUpperCase()) || null;
}
