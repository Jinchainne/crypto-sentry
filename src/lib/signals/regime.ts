/**
 * Regime classifier.
 *
 * Blends flow, sentiment and volatility signals into a composite score
 * and maps to Risk-On / Neutral / Risk-Off.
 */

import type {
  FlowSignal,
  SentimentSignal,
  VolatilitySignal,
  RegimeAssessment,
  Regime,
} from "@/lib/types";
import { clamp } from "@/lib/util/stats";

const WEIGHTS = { flow: 0.4, sentiment: 0.3, volatility: 0.3 } as const;
const RISK_ON_AT = 0.2;
const RISK_OFF_AT = -0.2;

const LABEL: Record<Regime, string> = {
  risk_on: "Risk-On",
  neutral: "Neutral",
  risk_off: "Risk-Off",
};

export function regimeLabel(r: Regime): string {
  return LABEL[r];
}

export interface RegimeInputs {
  flow: FlowSignal;
  sentiment: SentimentSignal;
  volatility: VolatilitySignal;
}

export function assessRegime(signals: RegimeInputs, asOf: number): RegimeAssessment {
  const { flow, sentiment, volatility } = signals;
  const composite = clamp(
    WEIGHTS.flow * flow.score +
      WEIGHTS.sentiment * sentiment.score +
      WEIGHTS.volatility * volatility.score,
    -1,
    1,
  );

  const regime: Regime =
    composite > RISK_ON_AT ? "risk_on" : composite < RISK_OFF_AT ? "risk_off" : "neutral";

  const scores = [flow.score, sentiment.score, volatility.score];
  const compositeSign = Math.sign(composite) || 1;
  const agree = scores.filter((s) => s !== 0 && Math.sign(s) === compositeSign).length / scores.length;
  let confidence = clamp(0.5 * Math.abs(composite) + 0.5 * agree, 0, 1);
  if (sentiment.sampleSize < 5) confidence *= 0.8;

  const rationale = [
    `Regime: ${LABEL[regime]} (composite ${composite >= 0 ? "+" : ""}${composite.toFixed(2)}, confidence ${(confidence * 100).toFixed(0)}%)`,
    flow.detail,
    sentiment.detail,
    volatility.detail,
  ];

  return {
    regime,
    vol: volatility.state,
    score: composite,
    confidence,
    rationale,
    signals: { flow, sentiment, volatility },
    asOf,
  };
}
