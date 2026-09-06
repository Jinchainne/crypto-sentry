/**
 * Pre-trade preview — shows expected fills, fees, and slippage.
 */

import type { TradeRequest } from "./router";

export interface TradePreview {
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  estimatedPrice: number;
  estimatedCost: number;
  fees: number;
  slippage: number;
  totalCost: number;
  mode: "paper" | "live";
  warnings: string[];
}

const SLIPPAGE_BPS = 15; // 0.15% default slippage estimate
const FEE_RATE = 0.001;  // 0.1%

export function previewTrade(req: TradeRequest): TradePreview {
  const mode = req.mode || "paper";
  const slippageFactor = SLIPPAGE_BPS / 10000;

  const slippageAdjPrice =
    req.side === "buy"
      ? req.price * (1 + slippageFactor)
      : req.price * (1 - slippageFactor);

  const estimatedCost = req.quantity * slippageAdjPrice;
  const fees = estimatedCost * FEE_RATE;
  const totalCost = req.side === "buy" ? estimatedCost + fees : estimatedCost - fees;

  const warnings: string[] = [];

  if (req.quantity * req.price > 50000) {
    warnings.push("Large order — consider splitting into smaller tranches");
  }
  if (req.orderType === "market") {
    warnings.push("Market orders may experience higher slippage in volatile conditions");
  }
  if (mode === "live") {
    warnings.push("⚠️ LIVE MODE — real funds at risk");
  }

  return {
    symbol: req.symbol,
    side: req.side,
    quantity: req.quantity,
    estimatedPrice: slippageAdjPrice,
    estimatedCost,
    fees,
    slippage: slippageFactor * 100,
    totalCost,
    mode,
    warnings,
  };
}
