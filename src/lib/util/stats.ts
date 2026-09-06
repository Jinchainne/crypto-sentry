/** Small numeric helpers shared by the signal engines. */

export function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

export function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

/** Population standard deviation. */
export function stdev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const variance = mean(xs.map((x) => (x - m) ** 2));
  return Math.sqrt(variance);
}

/** Average of absolute values. */
export function meanAbs(xs: number[]): number {
  return mean(xs.map(Math.abs));
}

/** Simple period-over-period returns from a price series. */
export function dailyReturns(closes: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const prev = closes[i - 1];
    if (prev !== 0) out.push(closes[i] / prev - 1);
  }
  return out;
}

/** Annualized volatility from periodic returns. */
export function annualizedVol(returns: number[], periodsPerYear = 365): number {
  return stdev(returns) * Math.sqrt(periodsPerYear);
}

/** Last N elements (or all if fewer). */
export function lastN<T>(xs: T[], n: number): T[] {
  return n >= xs.length ? xs.slice() : xs.slice(xs.length - n);
}
