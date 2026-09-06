/**
 * ETF net-flow signal.
 *
 * Sustained, above-typical net inflows into spot ETFs are a risk-on tell;
 * accelerating outflows are risk-off.
 */

import type { EtfFlowPoint } from "@/lib/sosovalue/schemas";
import type { FlowSignal } from "@/lib/types";
import { mean, stdev, meanAbs, lastN, clamp } from "@/lib/util/stats";

function assetFlowScore(series: number[]): number {
  if (series.length === 0) return 0;
  const recent = mean(lastN(series, 5));
  const typicalAbs = meanAbs(series) || 1;
  return clamp(Math.tanh((recent / typicalAbs) * 0.8), -1, 1);
}

function fmtMillions(usd: number): string {
  const m = usd / 1e6;
  const sign = m >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(m).toFixed(0)}m`;
}

export function computeFlowSignal(btc: EtfFlowPoint[], eth: EtfFlowPoint[]): FlowSignal {
  const byDate = new Map<string, number>();
  for (const p of [...btc, ...eth]) {
    byDate.set(p.date, (byDate.get(p.date) ?? 0) + p.netInflowUsd);
  }
  const dates = [...byDate.keys()].sort();
  const series = dates.map((d) => byDate.get(d)!);

  if (series.length === 0) {
    return {
      score: 0,
      detail: "ETF flows: no data",
      latestNetInflowUsd: 0,
      zScore: 0,
      trend: "flat",
      perAsset: {},
    };
  }

  const recent = mean(lastN(series, 5));
  const m = mean(series);
  const sd = stdev(series);
  const z = sd > 0 ? (recent - m) / sd : 0;
  const typicalAbs = meanAbs(series) || 1;
  const score = clamp(Math.tanh((recent / typicalAbs) * 0.8 + z * 0.2), -1, 1);
  const latest = series[series.length - 1];
  const trend: FlowSignal["trend"] =
    recent > 0.1 * typicalAbs ? "inflow" : recent < -0.1 * typicalAbs ? "outflow" : "flat";

  return {
    score,
    detail: `ETF flows ${fmtMillions(recent)}/day (5d avg), z=${z >= 0 ? "+" : ""}${z.toFixed(1)} → ${trend}`,
    latestNetInflowUsd: latest,
    zScore: z,
    trend,
    perAsset: {
      BTC: assetFlowScore(btc.map((p) => p.netInflowUsd)),
      ETH: assetFlowScore(eth.map((p) => p.netInflowUsd)),
    },
  };
}
