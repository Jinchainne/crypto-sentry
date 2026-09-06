/**
 * CryptoSentry tradeable universe.
 * Defines sectors, assets, and SSI index tickers for narrative rotation.
 */

export type Sector =
  | "majors"
  | "layer1"
  | "defi"
  | "meme"
  | "ai"
  | "payments";

export const SECTORS: readonly Sector[] = [
  "majors",
  "layer1",
  "defi",
  "meme",
  "ai",
  "payments",
] as const;

export interface Asset {
  symbol: string;
  name: string;
  sector: Sector;
  baseWeight: number;
}

export const UNIVERSE: Asset[] = [
  { symbol: "BTC", name: "Bitcoin", sector: "majors", baseWeight: 0.3 },
  { symbol: "ETH", name: "Ethereum", sector: "majors", baseWeight: 0.2 },
  { symbol: "SOL", name: "Solana", sector: "layer1", baseWeight: 0.1 },
  { symbol: "BNB", name: "BNB", sector: "layer1", baseWeight: 0.07 },
  { symbol: "AVAX", name: "Avalanche", sector: "layer1", baseWeight: 0.05 },
  { symbol: "LINK", name: "Chainlink", sector: "defi", baseWeight: 0.06 },
  { symbol: "UNI", name: "Uniswap", sector: "defi", baseWeight: 0.05 },
  { symbol: "DOGE", name: "Dogecoin", sector: "meme", baseWeight: 0.06 },
  { symbol: "FET", name: "Artificial Superintelligence Alliance", sector: "ai", baseWeight: 0.06 },
  { symbol: "XRP", name: "XRP", sector: "payments", baseWeight: 0.05 },
];

/** Sector -> SoSoValue SSI index ticker. */
export const SECTOR_SSI: Record<Sector, string> = {
  majors: "ssiMAG7",
  layer1: "ssiLayer1",
  defi: "ssiDeFi",
  meme: "ssiMeme",
  ai: "ssiAI",
  payments: "ssiPayFi",
};
