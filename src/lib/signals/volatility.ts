/**
 * Realized-volatility signal from a daily close series (BTC proxy).
 */

import type { Candle, VolatilitySignal, VolState } from "@/lib/types";
import { dailyReturns, annualizedVol, clamp, lastN } from "@/lib/util/stats";

const CALM_MAX = 0.45;
const ELEVATED_MAX = 0.75;

function classify(annVol: number): VolState {
  if (annVol < CALM_MAX) return "calm";
  if (annVol < ELEVATED_MAX) return "elevated";
  return "stressed";
}

export function computeVolatilitySignal(candles: Candle[], window = 30): VolatilitySignal {
  const closes = lastN(candles, window + 1).map((c) => c.c);
  if (closes.length < 3) {
    return { score: 0, detail: "Volatility: insufficient data", annualizedVol: 0, state: "calm" };
  }
  const annVol = annualizedVol(dailyReturns(closes));
  const state = classify(annVol);
  const score = clamp((0.6 - annVol) / 0.4, -1, 1);
  return {
    score,
    detail: `Realized vol ${(annVol * 100).toFixed(0)}% annualized → ${state}`,
    annualizedVol: annVol,
    state,
  };
}
