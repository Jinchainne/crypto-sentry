/**
 * Risk orchestrator — coordinates risk checks and exposes summary metrics.
 */

import { getPortfolio, getDailyLossPercent, getAllocation } from "../portfolio/store";
import { runRiskChecks } from "./sentinel";
import type { RiskCheckResult } from "./sentinel";
import type { TradeRequest } from "../execution/router";

export interface RiskMetrics {
  totalValue: number;
  cash: number;
  dailyPnl: number;
  dailyLossPct: number;
  positionCount: number;
  maxConcentration: number;
  riskScore: number; // 0-100, higher = riskier
  alerts: string[];
}

export function getRiskMetrics(): RiskMetrics {
  const portfolio = getPortfolio();
  const dailyLossPct = getDailyLossPercent();
  const allocation = getAllocation();

  const maxConcentration =
    allocation.length > 0 ? Math.max(...allocation.map((a) => a.percent)) : 0;

  const alerts: string[] = [];
  if (dailyLossPct > 3) alerts.push("Daily loss approaching 5% limit");
  if (maxConcentration > 20) alerts.push("High concentration in single asset");
  if (portfolio.positions.length === 0 && portfolio.cash === portfolio.totalValue) {
    alerts.push("Fully in cash — consider deploying capital");
  }

  // Composite risk score
  let riskScore = 0;
  riskScore += Math.min(dailyLossPct * 10, 50);
  riskScore += Math.min(maxConcentration, 30);
  riskScore += Math.min(portfolio.positions.length * 5, 20);

  return {
    totalValue: portfolio.totalValue,
    cash: portfolio.cash,
    dailyPnl: portfolio.dailyPnl,
    dailyLossPct,
    positionCount: portfolio.positions.length,
    maxConcentration,
    riskScore: Math.min(Math.round(riskScore), 100),
    alerts,
  };
}

export { runRiskChecks };
export type { RiskCheckResult };
