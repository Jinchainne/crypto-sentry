/**
 * Risk Sentinel — pre-trade risk checks.
 *
 * Rules:
 * - Max position size: 10% of portfolio
 * - Max daily loss: 5%
 * - Concentration limit: no more than 30% in a single asset
 * - Volatility-adjusted sizing (reduce size in high vol)
 */

import { getPortfolio, getDailyLossPercent } from "../portfolio/store";
import type { TradeRequest } from "../execution/router";

export interface RiskCheckResult {
  passed: boolean;
  checks: { name: string; passed: boolean; detail: string }[];
  adjustedQuantity?: number;
  warnings: string[];
}

const MAX_POSITION_PCT = 10;     // 10% of portfolio
const MAX_DAILY_LOSS_PCT = 5;    // 5% daily stop
const MAX_CONCENTRATION_PCT = 30; // 30% max in one asset
const VOLATILITY_MULTIPLIER: Record<string, number> = {
  calm: 1.0,
  elevated: 0.7,
  stressed: 0.5,
};

export function runRiskChecks(
  req: TradeRequest,
  volatilityState?: string
): RiskCheckResult {
  const portfolio = getPortfolio();
  const checks: { name: string; passed: boolean; detail: string }[] = [];
  const warnings: string[] = [];
  let adjustedQuantity = req.quantity;

  // 1. Daily loss check
  const dailyLoss = getDailyLossPercent();
  const dailyPassed = dailyLoss < MAX_DAILY_LOSS_PCT;
  checks.push({
    name: "Daily Loss Limit",
    passed: dailyPassed,
    detail: `Daily loss: ${dailyLoss.toFixed(2)}% (limit: ${MAX_DAILY_LOSS_PCT}%)`,
  });

  // 2. Position size check
  const tradeValue = req.quantity * req.price;
  const positionPct = (tradeValue / portfolio.totalValue) * 100;
  const sizePassed = positionPct <= MAX_POSITION_PCT;
  checks.push({
    name: "Position Size Limit",
    passed: sizePassed,
    detail: `Position: ${positionPct.toFixed(1)}% of portfolio (limit: ${MAX_POSITION_PCT}%)`,
  });

  if (!sizePassed) {
    adjustedQuantity = (MAX_POSITION_PCT / 100) * portfolio.totalValue / req.price;
    warnings.push(`Quantity adjusted from ${req.quantity} to ${adjustedQuantity.toFixed(4)}`);
  }

  // 3. Concentration check
  const existingPos = portfolio.positions.find((p) => p.symbol === req.symbol);
  const existingValue = existingPos ? existingPos.quantity * existingPos.currentPrice : 0;
  const totalAfterTrade = existingValue + tradeValue;
  const concentrationPct = (totalAfterTrade / portfolio.totalValue) * 100;
  const concPassed = concentrationPct <= MAX_CONCENTRATION_PCT;
  checks.push({
    name: "Concentration Limit",
    passed: concPassed,
    detail: `${req.symbol} concentration: ${concentrationPct.toFixed(1)}% (limit: ${MAX_CONCENTRATION_PCT}%)`,
  });

  // 4. Volatility-adjusted sizing
  const volState = volatilityState || "calm";
  const volMultiplier = VOLATILITY_MULTIPLIER[volState] || 1.0;
  if (volMultiplier < 1.0) {
    const volAdjusted = adjustedQuantity * volMultiplier;
    checks.push({
      name: "Volatility Adjustment",
      passed: true,
      detail: `High volatility (${volState}) — sizing reduced to ${volMultiplier}x. Adjusted qty: ${volAdjusted.toFixed(4)}`,
    });
    adjustedQuantity = volAdjusted;
    warnings.push(`Volatility-adjusted quantity: ${volAdjusted.toFixed(4)} (${volState} regime)`);
  } else {
    checks.push({
      name: "Volatility Adjustment",
      passed: true,
      detail: `Volatility: ${volState} — no adjustment needed`,
    });
  }

  const passed = checks.every((c) => c.passed);

  return { passed, checks, adjustedQuantity, warnings };
}
