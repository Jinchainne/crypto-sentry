/**
 * SoSoValue provider selector.
 *
 * Uses the real API when SOSOVALUE_API_KEY is set, otherwise the deterministic mock.
 */

import { createSosoClient } from "@/lib/sosovalue/client";
import { createMockProvider } from "@/lib/sosovalue/mock";
import type { SosoProvider } from "@/lib/sosovalue/provider";

let cached: SosoProvider | null = null;

export function getProvider(): SosoProvider {
  if (cached) return cached;
  const key = process.env.SOSOVALUE_API_KEY;
  const mode = process.env.DATA_MODE ?? (key ? "live" : "mock");
  cached = mode === "live" && key ? createSosoClient({ apiKey: key }) : createMockProvider();
  return cached;
}

export function resetProvider(): void {
  cached = null;
}

export type { SosoProvider, NewsParams, KlineParams } from "@/lib/sosovalue/provider";
