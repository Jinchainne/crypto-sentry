/**
 * Live SoSoValue Open API client.
 */

import { z } from "zod";
import type { Candle } from "@/lib/types";
import { TtlCache, RateLimiter } from "@/lib/sosovalue/cache";
import type { SosoProvider, NewsParams, KlineParams } from "@/lib/sosovalue/provider";
import {
  paginated,
  newsItemRawSchema,
  toNewsItem,
  etfFlowRawSchema,
  toEtfFlowPoint,
  indexListSchema,
  constituentRawSchema,
  toConstituent,
  indexSnapshotRawSchema,
  toIndexSnapshot,
  klineRawSchema,
  type KlineRaw,
  currencyRefRawSchema,
  toCurrencyRef,
  macroEventRawSchema,
} from "@/lib/sosovalue/schemas";

export const SOSO_BASE_URL = "https://openapi.sosovalue.com/openapi/v1";

const TTL = {
  news: 5 * 60_000,
  etf: 60 * 60_000,
  indices: 6 * 60 * 60_000,
  snapshot: 30 * 60_000,
  klines: 60 * 60_000,
  constituents: 6 * 60 * 60_000,
  currencies: 24 * 60 * 60_000,
  macro: 60 * 60_000,
} as const;

export class SosoApiError extends Error {
  constructor(
    public readonly code: number,
    message: string,
  ) {
    super(message);
    this.name = "SosoApiError";
  }
}

export interface SosoClientOptions {
  apiKey: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  cache?: TtlCache<unknown>;
  limiter?: RateLimiter;
}

function queryString(query: Record<string, string | number | undefined>): string {
  const parts = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

function toCandle(k: KlineRaw): Candle {
  return { t: k.timestamp, o: k.open, h: k.high, l: k.low, c: k.close, v: k.volume };
}

export function createSosoClient(opts: SosoClientOptions): SosoProvider {
  const baseUrl = opts.baseUrl ?? SOSO_BASE_URL;
  const fetchImpl = opts.fetchImpl ?? fetch;
  const cache = opts.cache ?? new TtlCache<unknown>();
  const limiter = opts.limiter ?? new RateLimiter(18, 60_000);

  async function call<T>(
    path: string,
    query: Record<string, string | number | undefined>,
    dataSchema: z.ZodType<T>,
    ttlMs: number,
  ): Promise<T> {
    const url = baseUrl + path + queryString(query);
    const cacheKey = url;
    return cache.getOrSet(cacheKey, ttlMs, async () => {
      await limiter.acquire();
      const res = await fetchImpl(url, {
        headers: { "x-soso-api-key": opts.apiKey, accept: "application/json" },
      });
      if (!res.ok) throw new SosoApiError(res.status, `HTTP ${res.status} for ${path}`);
      const json = await res.json();
      const base = z
        .object({ code: z.number(), message: z.string().optional(), data: z.unknown() })
        .parse(json);
      if (base.code !== 0) {
        throw new SosoApiError(base.code, base.message ?? `error for ${path}`);
      }
      return dataSchema.parse(base.data);
    }) as Promise<T>;
  }

  return {
    async getNews(params: NewsParams = {}) {
      const data = await call(
        "/news",
        {
          category: params.category,
          language: params.language ?? "en",
          currency_id: params.currencyId,
          page: 1,
          page_size: params.pageSize ?? 100,
        },
        paginated(newsItemRawSchema),
        TTL.news,
      );
      return data.list.map(toNewsItem);
    },

    async getEtfSummaryHistory(symbol: string, country = "US") {
      const data = await call(
        "/etfs/summary-history",
        { symbol, country_code: country, limit: 90 },
        z.array(etfFlowRawSchema),
        TTL.etf,
      );
      return data.map(toEtfFlowPoint);
    },

    async listIndices() {
      return call("/indices", {}, indexListSchema, TTL.indices);
    },

    async getIndexSnapshot(ticker: string) {
      const data = await call(
        `/indices/${encodeURIComponent(ticker)}/market-snapshot`,
        {},
        indexSnapshotRawSchema,
        TTL.snapshot,
      );
      return toIndexSnapshot(ticker, data);
    },

    async getIndexKlines(ticker: string, params: KlineParams = {}) {
      const data = await call(
        `/indices/${encodeURIComponent(ticker)}/klines`,
        {
          interval: params.interval ?? "1d",
          start_time: params.startTime,
          end_time: params.endTime,
          limit: params.limit ?? 90,
        },
        z.array(klineRawSchema),
        TTL.klines,
      );
      return data.map(toCandle);
    },

    async getIndexConstituents(ticker: string) {
      const data = await call(
        `/indices/${encodeURIComponent(ticker)}/constituents`,
        {},
        z.array(constituentRawSchema),
        TTL.constituents,
      );
      return data.map(toConstituent);
    },

    async listCurrencies() {
      const data = await call("/currencies", {}, z.array(currencyRefRawSchema), TTL.currencies);
      return data.map(toCurrencyRef);
    },

    async getCurrencyKlines(currencyId: string, params: KlineParams = {}) {
      const data = await call(
        `/currencies/${encodeURIComponent(currencyId)}/klines`,
        {
          interval: params.interval ?? "1d",
          start_time: params.startTime,
          end_time: params.endTime,
          limit: params.limit ?? 90,
        },
        z.array(klineRawSchema),
        TTL.klines,
      );
      return data.map(toCandle);
    },

    async getMacroEvents() {
      return call("/macro/events", {}, z.array(macroEventRawSchema), TTL.macro);
    },
  };
}
