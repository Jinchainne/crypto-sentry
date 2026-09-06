/**
 * Zod schemas + domain mappers for the SoSoValue Open API.
 */

import { z } from "zod";

export function paginated<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    list: z.array(item),
    page: z.coerce.number().optional(),
    page_size: z.coerce.number().optional(),
    total: z.coerce.number().optional(),
  });
}

// News / Feeds

const matchedCurrencySchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  full_name: z.string().optional(),
  name: z.string().optional(),
});

export const newsItemRawSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  title: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  release_time: z.coerce.number().optional(),
  create_time: z.coerce.number().optional(),
  category: z.coerce.number().optional().default(0),
  impression_count: z.coerce.number().optional().default(0),
  like_count: z.coerce.number().optional().default(0),
  reply_count: z.coerce.number().optional().default(0),
  retweet_count: z.coerce.number().optional().default(0),
  matched_currencies: z.array(matchedCurrencySchema).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
});

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  releaseTime: number;
  category: number;
  matchedSymbols: string[];
  tags: string[];
  engagement: number;
}

export function toNewsItem(raw: z.infer<typeof newsItemRawSchema>): NewsItem {
  return {
    id: raw.id,
    title: raw.title ?? "",
    content: raw.content ?? "",
    releaseTime: raw.release_time ?? raw.create_time ?? 0,
    category: raw.category,
    matchedSymbols: (raw.matched_currencies ?? [])
      .map((c) => (c.name ?? "").toUpperCase())
      .filter(Boolean),
    tags: raw.tags ?? [],
    engagement:
      raw.impression_count +
      raw.like_count +
      raw.reply_count +
      raw.retweet_count,
  };
}

// ETF net flows

export const etfFlowRawSchema = z.object({
  date: z.union([z.string(), z.number()]),
  total_net_inflow: z.coerce.number(),
  cum_net_inflow: z.coerce.number().optional().default(0),
  total_net_assets: z.coerce.number().optional().default(0),
});

export interface EtfFlowPoint {
  date: string;
  netInflowUsd: number;
  cumInflowUsd: number;
}

export function toEtfFlowPoint(raw: z.infer<typeof etfFlowRawSchema>): EtfFlowPoint {
  return {
    date: String(raw.date),
    netInflowUsd: raw.total_net_inflow,
    cumInflowUsd: raw.cum_net_inflow,
  };
}

// SSI indices

export const indexListSchema = z.array(z.string());

export const constituentRawSchema = z.object({
  currency_id: z.union([z.string(), z.number()]).transform(String),
  symbol: z.string(),
  weight: z.coerce.number(),
});

export interface Constituent {
  currencyId: string;
  symbol: string;
  weight: number;
}

export function toConstituent(raw: z.infer<typeof constituentRawSchema>): Constituent {
  return { currencyId: raw.currency_id, symbol: raw.symbol, weight: raw.weight };
}

export const indexSnapshotRawSchema = z.object({
  price: z.coerce.number().optional().default(0),
  change_pct_24h: z.coerce.number().optional().default(0),
  roi_7d: z.coerce.number().optional().default(0),
  roi_1m: z.coerce.number().optional().default(0),
  roi_3m: z.coerce.number().optional().default(0),
});

export interface IndexSnapshot {
  ticker: string;
  price: number;
  change24hPct: number;
  roi7d: number;
  roi1m: number;
  roi3m: number;
}

export function toIndexSnapshot(
  ticker: string,
  raw: z.infer<typeof indexSnapshotRawSchema>,
): IndexSnapshot {
  return {
    ticker,
    price: raw.price,
    change24hPct: raw.change_pct_24h * 100,
    roi7d: raw.roi_7d,
    roi1m: raw.roi_1m,
    roi3m: raw.roi_3m,
  };
}

// Klines

export const klineRawSchema = z.object({
  timestamp: z.coerce.number(),
  open: z.coerce.number(),
  high: z.coerce.number(),
  low: z.coerce.number(),
  close: z.coerce.number(),
  volume: z.coerce.number().optional(),
});

export type KlineRaw = z.infer<typeof klineRawSchema>;

// Currencies

export const currencyRefRawSchema = z.object({
  currency_id: z.union([z.string(), z.number()]).transform(String),
  symbol: z.string(),
  name: z.string().optional().default(""),
});

export interface CurrencyRef {
  currencyId: string;
  symbol: string;
  name: string;
}

export function toCurrencyRef(raw: z.infer<typeof currencyRefRawSchema>): CurrencyRef {
  return { currencyId: raw.currency_id, symbol: raw.symbol, name: raw.name };
}

// Macro

export const macroEventRawSchema = z.object({
  date: z.string(),
  events: z.array(z.string()).optional().default([]),
});

export interface MacroEvent {
  date: string;
  events: string[];
}
