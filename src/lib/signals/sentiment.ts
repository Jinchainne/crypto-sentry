/**
 * News sentiment signal.
 *
 * Lexicon-based sentiment scoring over headlines + body, weighted by engagement.
 */

import type { NewsItem } from "@/lib/sosovalue/schemas";
import type { SentimentSignal } from "@/lib/types";
import { clamp } from "@/lib/util/stats";

const POSITIVE = [
  "surge", "surges", "rally", "rallies", "soar", "soars", "gain", "gains", "bullish",
  "record", "high", "highs", "breakout", "inflow", "inflows", "adopt", "adoption",
  "upgrade", "partnership", "approve", "approved", "approval", "milestone", "strong",
  "outperform", "optimistic", "demand", "leads", "lead", "higher", "jump", "jumps",
  "boom", "accumulate", "accumulation", "support", "win", "wins", "green",
];
const NEGATIVE = [
  "slide", "slides", "drop", "drops", "fall", "falls", "plunge", "plunges", "bearish",
  "low", "lows", "breakdown", "outflow", "outflows", "hack", "exploit", "ban", "banned",
  "lawsuit", "sell-off", "selloff", "dump", "dumps", "weak", "underperform", "fear",
  "jitters", "crash", "slump", "profit-taking", "dip", "dips", "liquidation",
  "liquidations", "warning", "risk", "red", "loss", "losses", "decline",
];

const POS = new Set(POSITIVE);
const NEG = new Set(NEGATIVE);

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, " ");
}

export function scoreText(text: string): number {
  const tokens = stripHtml(text)
    .toLowerCase()
    .split(/[^a-z-]+/)
    .filter(Boolean);
  let pos = 0;
  let neg = 0;
  for (const tok of tokens) {
    if (POS.has(tok)) pos++;
    else if (NEG.has(tok)) neg++;
  }
  if (pos + neg === 0) return 0;
  return (pos - neg) / (pos + neg);
}

function engagementWeight(engagement: number): number {
  return Math.log10(10 + Math.max(0, engagement));
}

export function computeSentimentSignal(news: NewsItem[]): SentimentSignal {
  if (news.length === 0) {
    return { score: 0, detail: "News sentiment: no items", sampleSize: 0, perAsset: {} };
  }

  let wSum = 0;
  let wScore = 0;
  const perAssetAcc: Record<string, { w: number; s: number }> = {};

  for (const item of news) {
    const s = scoreText(`${item.title} ${item.content}`);
    const w = engagementWeight(item.engagement);
    wSum += w;
    wScore += s * w;
    for (const sym of item.matchedSymbols) {
      const acc = (perAssetAcc[sym] ??= { w: 0, s: 0 });
      acc.w += w;
      acc.s += s * w;
    }
  }

  const score = clamp(wSum > 0 ? wScore / wSum : 0, -1, 1);
  const perAsset: Record<string, number> = {};
  for (const [sym, acc] of Object.entries(perAssetAcc)) {
    perAsset[sym] = acc.w > 0 ? clamp(acc.s / acc.w, -1, 1) : 0;
  }

  const tone = score > 0.15 ? "bullish" : score < -0.15 ? "bearish" : "mixed";
  return {
    score,
    detail: `News sentiment ${score >= 0 ? "+" : ""}${score.toFixed(2)} (${tone}) across ${news.length} items`,
    sampleSize: news.length,
    perAsset,
  };
}
