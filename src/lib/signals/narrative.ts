/**
 * Narrative / sector-rotation ranking.
 *
 * Ranks sectors by momentum blend of 7d + 30d returns.
 */

import type { NarrativeRanking, SectorScore } from "@/lib/types";
import type { Sector } from "@/lib/universe";

export interface SectorMomentumInput {
  sector: Sector;
  roi7d: number;
  roi1m: number;
}

function pct(x: number): string {
  return `${x >= 0 ? "+" : ""}${(x * 100).toFixed(1)}%`;
}

export function rankNarratives(inputs: SectorMomentumInput[], asOf: number): NarrativeRanking {
  const ranked: SectorScore[] = inputs
    .map((i) => {
      const momentum = 0.45 * i.roi7d + 0.55 * i.roi1m;
      return {
        sector: i.sector,
        score: momentum,
        momentum,
        detail: `${i.sector}: 7d ${pct(i.roi7d)}, 30d ${pct(i.roi1m)}`,
      };
    })
    .sort((a, b) => b.score - a.score);

  const leader = ranked.length ? ranked[0].sector : "majors";
  return { leader, ranked, asOf };
}
