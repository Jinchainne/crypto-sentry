/**
 * Signal orchestrator: fetches inputs once and produces the
 * regime assessment + narrative ranking.
 */

import type { RegimeAssessment, NarrativeRanking, Candle } from "@/lib/types";
import { UNIVERSE, SECTORS, SECTOR_SSI, type Sector } from "@/lib/universe";
import type { SosoProvider } from "@/lib/sosovalue/provider";
import type { CurrencyRef } from "@/lib/sosovalue/schemas";
import { getProvider } from "@/lib/sosovalue";
import { computeFlowSignal } from "@/lib/signals/flows";
import { computeSentimentSignal } from "@/lib/signals/sentiment";
import { computeVolatilitySignal } from "@/lib/signals/volatility";
import { assessRegime } from "@/lib/signals/regime";
import { rankNarratives, type SectorMomentumInput } from "@/lib/signals/narrative";

export * from "@/lib/signals/regime";
export * from "@/lib/signals/narrative";

export interface SignalBundle {
  regime: RegimeAssessment;
  narrative: NarrativeRanking;
}

function roiFromCandles(candles: Candle[], lookback: number): number {
  if (candles.length < 2) return 0;
  const last = candles[candles.length - 1].c;
  const ref = candles[Math.max(0, candles.length - 1 - lookback)].c;
  return ref === 0 ? 0 : last / ref - 1;
}

function currencyId(currencies: CurrencyRef[], symbol: string): string | undefined {
  return currencies.find((c) => c.symbol.toUpperCase() === symbol.toUpperCase())?.currencyId;
}

async function sectorFallback(
  provider: SosoProvider,
  sector: Sector,
  currencies: CurrencyRef[],
): Promise<SectorMomentumInput> {
  const top = UNIVERSE.filter((a) => a.sector === sector).sort(
    (a, b) => b.baseWeight - a.baseWeight,
  )[0];
  const id = top ? currencyId(currencies, top.symbol) : undefined;
  if (!id) return { sector, roi7d: 0, roi1m: 0 };
  const candles = await provider.getCurrencyKlines(id, { limit: 35 }).catch(() => []);
  return { sector, roi7d: roiFromCandles(candles, 7), roi1m: roiFromCandles(candles, 30) };
}

export async function buildSignals(
  provider: SosoProvider = getProvider(),
  now: number = Date.now(),
): Promise<SignalBundle> {
  const [btcFlows, ethFlows, news, indices, currencies] = await Promise.all([
    provider.getEtfSummaryHistory("BTC").catch(() => []),
    provider.getEtfSummaryHistory("ETH").catch(() => []),
    provider.getNews({ category: 1, pageSize: 100 }).catch(() => []),
    provider.listIndices().catch(() => [] as string[]),
    provider.listCurrencies().catch(() => [] as CurrencyRef[]),
  ]);

  const btcId = currencyId(currencies, "BTC");
  const btcCandles = btcId
    ? await provider.getCurrencyKlines(btcId, { limit: 60 }).catch(() => [])
    : [];

  const available = new Set(indices);
  const sectorInputs = await Promise.all(
    SECTORS.map(async (sector): Promise<SectorMomentumInput> => {
      const ticker = SECTOR_SSI[sector];
      if (indices.length === 0 || available.has(ticker)) {
        const snap = await provider.getIndexSnapshot(ticker).catch(() => null);
        if (snap) return { sector, roi7d: snap.roi7d, roi1m: snap.roi1m };
      }
      return sectorFallback(provider, sector, currencies);
    }),
  );

  const flow = computeFlowSignal(btcFlows, ethFlows);
  const sentiment = computeSentimentSignal(news);
  const volatility = computeVolatilitySignal(btcCandles);

  return {
    regime: assessRegime({ flow, sentiment, volatility }, now),
    narrative: rankNarratives(sectorInputs, now),
  };
}
