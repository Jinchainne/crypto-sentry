/**
 * Deterministic mock SoSoValue provider.
 */

import type { Candle } from "@/lib/types";
import { UNIVERSE, SECTORS, SECTOR_SSI, type Sector } from "@/lib/universe";
import { makeRng, gaussian } from "@/lib/util/random";
import type { SosoProvider, NewsParams, KlineParams } from "@/lib/sosovalue/provider";
import type {
  NewsItem,
  EtfFlowPoint,
  IndexSnapshot,
  Constituent,
  CurrencyRef,
  MacroEvent,
} from "@/lib/sosovalue/schemas";

const DAY = 86_400_000;

const PROFILE: Record<string, { start: number; drift: number; vol: number }> = {
  BTC: { start: 64000, drift: 0.0022, vol: 0.022 },
  ETH: { start: 3400, drift: 0.0018, vol: 0.03 },
  SOL: { start: 150, drift: 0.004, vol: 0.05 },
  BNB: { start: 580, drift: 0.0015, vol: 0.03 },
  AVAX: { start: 35, drift: 0.0025, vol: 0.05 },
  LINK: { start: 18, drift: 0.002, vol: 0.045 },
  UNI: { start: 11, drift: 0.0015, vol: 0.05 },
  DOGE: { start: 0.16, drift: 0.0005, vol: 0.07 },
  FET: { start: 1.4, drift: 0.0075, vol: 0.06 },
  XRP: { start: 0.6, drift: 0.0008, vol: 0.04 },
};
const DEFAULT_PROFILE = { start: 100, drift: 0.001, vol: 0.04 };

const SECTOR_PROFILE: Record<Sector, { start: number; drift: number; vol: number }> = {
  majors: { start: 1000, drift: 0.002, vol: 0.01 },
  layer1: { start: 1000, drift: 0.0035, vol: 0.01 },
  defi: { start: 1000, drift: 0.0015, vol: 0.01 },
  meme: { start: 1000, drift: -0.001, vol: 0.012 },
  ai: { start: 1000, drift: 0.01, vol: 0.01 },
  payments: { start: 1000, drift: 0.0008, vol: 0.01 },
};

function dayFloor(ms: number): number {
  return Math.floor(ms / DAY) * DAY;
}

function priceWalk(
  seed: string,
  days: number,
  profile: { start: number; drift: number; vol: number },
  endMs: number,
  withVolume: boolean,
): Candle[] {
  const rng = makeRng(seed);
  const end = dayFloor(endMs);
  let price = profile.start;
  const out: Candle[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const t = end - i * DAY;
    const open = price;
    const ret = profile.drift + profile.vol * gaussian(rng);
    price = Math.max(open * (1 + ret), 1e-9);
    const close = price;
    const wick = Math.abs(gaussian(rng)) * profile.vol * 0.5;
    const high = Math.max(open, close) * (1 + wick);
    const low = Math.min(open, close) * (1 - wick);
    out.push({
      t,
      o: open,
      h: high,
      l: low,
      c: close,
      v: withVolume ? Math.round((50000 + rng() * 50000) * profile.start) : undefined,
    });
  }
  return out;
}

function roi(series: Candle[], lookback: number): number {
  if (series.length < 2) return 0;
  const last = series[series.length - 1].c;
  const ref = series[Math.max(0, series.length - 1 - lookback)].c;
  return ref === 0 ? 0 : last / ref - 1;
}

const BULLISH = [
  "{A} ETF inflows hit a record as institutions pile in",
  "{A} breaks out to a new local high on strong demand",
  "Analysts turn bullish on {A} as the {S} narrative heats up",
  "{A} rallies; {S} sector leads the market higher",
];
const BEARISH = [
  "{A} slides as profit-taking hits the {S} sector",
  "Outflows accelerate from {A} products",
  "{A} dips on macro jitters",
];
const NEUTRAL = [
  "{A} trades sideways ahead of CPI",
  "{S} sector consolidates as {A} holds flat",
  "Weekly recap: where {A} and the {S} space stand",
];

const SECTOR_BULLISH_BIAS: Record<Sector, number> = {
  majors: 0.65,
  layer1: 0.7,
  defi: 0.55,
  meme: 0.45,
  ai: 0.85,
  payments: 0.4,
};

export interface MockOptions {
  seed?: string;
  now?: () => number;
}

export function createMockProvider(opts: MockOptions = {}): SosoProvider {
  const seedBase = opts.seed ?? "cryptosentry-v1";
  const now = opts.now ?? Date.now;
  const seriesCache = new Map<string, Candle[]>();

  function currencySeries(symbol: string): Candle[] {
    const key = `cur:${symbol}`;
    const cached = seriesCache.get(key);
    if (cached) return cached;
    const profile = PROFILE[symbol.toUpperCase()] ?? DEFAULT_PROFILE;
    const s = priceWalk(`${seedBase}:cur:${symbol}`, 90, profile, now(), true);
    seriesCache.set(key, s);
    return s;
  }

  function sectorTickerSeries(ticker: string): Candle[] {
    const key = `idx:${ticker}`;
    const cached = seriesCache.get(key);
    if (cached) return cached;
    const sector = SECTORS.find((sec) => SECTOR_SSI[sec] === ticker) ?? "majors";
    const s = priceWalk(`${seedBase}:idx:${ticker}`, 90, SECTOR_PROFILE[sector], now(), false);
    seriesCache.set(key, s);
    return s;
  }

  function symbolFromCurrencyId(currencyId: string): string {
    return currencyId.startsWith("mock-") ? currencyId.slice(5) : currencyId;
  }

  return {
    async getNews(params: NewsParams = {}): Promise<NewsItem[]> {
      const rng = makeRng(`${seedBase}:news`);
      const items: NewsItem[] = [];
      const count = params.pageSize ?? 48;
      for (let i = 0; i < count; i++) {
        const asset = UNIVERSE[Math.floor(rng() * UNIVERSE.length)];
        const bias = SECTOR_BULLISH_BIAS[asset.sector];
        const roll = rng();
        let pool: string[];
        if (roll < bias * 0.8) pool = BULLISH;
        else if (roll > 0.85) pool = BEARISH;
        else pool = NEUTRAL;
        const template = pool[Math.floor(rng() * pool.length)];
        const title = template.replace("{A}", asset.name).replace("{S}", asset.sector);
        items.push({
          id: `mock-news-${i}`,
          title,
          content: `<p>${title}.</p>`,
          releaseTime: dayFloor(now()) - Math.floor(rng() * 3) * DAY - Math.floor(rng() * DAY),
          category: 1,
          matchedSymbols: [asset.symbol],
          tags: [asset.sector],
          engagement: Math.round(100 + rng() * 50000),
        });
      }
      return items.sort((a, b) => b.releaseTime - a.releaseTime);
    },

    async getEtfSummaryHistory(symbol: string): Promise<EtfFlowPoint[]> {
      const rng = makeRng(`${seedBase}:etf:${symbol}`);
      const mean =
        symbol.toUpperCase() === "BTC" ? 260e6 : symbol.toUpperCase() === "ETH" ? 75e6 : 18e6;
      const spread = mean * 0.9 + 30e6;
      const end = dayFloor(now());
      const out: EtfFlowPoint[] = [];
      let cum = 12e9;
      for (let i = 59; i >= 0; i--) {
        const t = end - i * DAY;
        const netInflowUsd = Math.round(mean + spread * gaussian(rng));
        cum += netInflowUsd;
        out.push({
          date: new Date(t).toISOString().slice(0, 10),
          netInflowUsd,
          cumInflowUsd: Math.round(cum),
        });
      }
      return out;
    },

    async listIndices(): Promise<string[]> {
      return Array.from(new Set(SECTORS.map((s) => SECTOR_SSI[s])));
    },

    async getIndexSnapshot(ticker: string): Promise<IndexSnapshot> {
      const series = sectorTickerSeries(ticker);
      return {
        ticker,
        price: series[series.length - 1].c,
        change24hPct: roi(series, 1) * 100,
        roi7d: roi(series, 7),
        roi1m: roi(series, 30),
        roi3m: roi(series, 90),
      };
    },

    async getIndexKlines(ticker: string, params: KlineParams = {}): Promise<Candle[]> {
      const series = sectorTickerSeries(ticker);
      const limit = params.limit ?? series.length;
      return series.slice(-limit);
    },

    async getIndexConstituents(ticker: string): Promise<Constituent[]> {
      const members = UNIVERSE.filter((a) => SECTOR_SSI[a.sector] === ticker);
      const total = members.reduce((s, a) => s + a.baseWeight, 0) || 1;
      return members.map((a) => ({
        currencyId: `mock-${a.symbol}`,
        symbol: a.symbol,
        weight: a.baseWeight / total,
      }));
    },

    async listCurrencies(): Promise<CurrencyRef[]> {
      return UNIVERSE.map((a) => ({
        currencyId: `mock-${a.symbol}`,
        symbol: a.symbol,
        name: a.name,
      }));
    },

    async getCurrencyKlines(currencyId: string, params: KlineParams = {}): Promise<Candle[]> {
      const series = currencySeries(symbolFromCurrencyId(currencyId));
      const limit = params.limit ?? series.length;
      return series.slice(-limit);
    },

    async getMacroEvents(): Promise<MacroEvent[]> {
      const end = dayFloor(now());
      return [
        { date: new Date(end + 2 * DAY).toISOString().slice(0, 10), events: ["CPI"] },
        { date: new Date(end + 9 * DAY).toISOString().slice(0, 10), events: ["FOMC Rate Decision"] },
      ];
    },
  };
}
