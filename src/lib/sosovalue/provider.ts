/**
 * SoSoValue data provider interface.
 */

import type { Candle } from "@/lib/types";
import type {
  NewsItem,
  EtfFlowPoint,
  IndexSnapshot,
  Constituent,
  CurrencyRef,
  MacroEvent,
} from "@/lib/sosovalue/schemas";

export interface NewsParams {
  category?: number;
  language?: string;
  currencyId?: string;
  pageSize?: number;
}

export interface KlineParams {
  interval?: "1d";
  startTime?: number;
  endTime?: number;
  limit?: number;
}

export interface SosoProvider {
  getNews(params?: NewsParams): Promise<NewsItem[]>;
  getEtfSummaryHistory(symbol: string, country?: string): Promise<EtfFlowPoint[]>;
  listIndices(): Promise<string[]>;
  getIndexSnapshot(ticker: string): Promise<IndexSnapshot>;
  getIndexKlines(ticker: string, params?: KlineParams): Promise<Candle[]>;
  getIndexConstituents(ticker: string): Promise<Constituent[]>;
  listCurrencies(): Promise<CurrencyRef[]>;
  getCurrencyKlines(currencyId: string, params?: KlineParams): Promise<Candle[]>;
  getMacroEvents(): Promise<MacroEvent[]>;
}
