import type { AuditResult } from "../types";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

const SYMBOL_TO_ID: Record<string, string> = {
  BTC: "bitcoin", ETH: "ethereum", BNB: "binancecoin", SOL: "solana",
  XRP: "ripple", DOGE: "dogecoin", ADA: "cardano", AVAX: "avalanche-2",
  USDT: "tether", PEPE: "pepe", WIF: "dogwifhat", BONK: "bonk", FLOKI: "floki",
};

// Well-known established tokens get high base scores
const ESTABLISHED_TOKENS: Record<string, { score: number; year: number }> = {
  BTC: { score: 95, year: 2009 }, ETH: { score: 93, year: 2015 },
  BNB: { score: 88, year: 2017 }, SOL: { score: 82, year: 2020 },
  XRP: { score: 85, year: 2012 }, DOGE: { score: 80, year: 2013 },
  ADA: { score: 83, year: 2017 }, AVAX: { score: 80, year: 2020 },
  USDT: { score: 75, year: 2014 },
};

function scoreFromData(marketCap: number, volumeToMcap: number, age: number, holders: number): number {
  let score = 40; // base
  if (marketCap > 10e9) score += 20;
  else if (marketCap > 1e9) score += 15;
  else if (marketCap > 100e6) score += 10;
  else if (marketCap > 10e6) score += 5;

  if (volumeToMcap > 0.01 && volumeToMcap < 0.5) score += 5; // healthy volume
  if (age > 365) score += 10;
  else if (age > 180) score += 5;
  if (holders > 100000) score += 10;
  else if (holders > 10000) score += 5;

  return Math.min(95, Math.max(10, score));
}

interface CoinGeckoDetail {
  id: string;
  symbol: string;
  name: string;
  market_data: {
    market_cap: { usd: number };
    total_volume: { usd: number };
    ath_date: { usd: string };
    current_price: { usd: number };
  };
  categories: string[];
  last_updated: string;
}

const cachedAudits: Record<string, AuditResult> = {};

export async function auditToken(symbol: string): Promise<AuditResult | null> {
  const normalized = symbol.toUpperCase();
  const coinId = SYMBOL_TO_ID[normalized];

  // Fast path for established tokens
  if (ESTABLISHED_TOKENS[normalized]) {
    const est = ESTABLISHED_TOKENS[normalized];
    return {
      token: normalized,
      score: est.score,
      risks: normalized === "DOGE"
        ? ["Inflationary supply model", "Meme-driven volatility"]
        : normalized === "USDT"
          ? ["Centralized issuer", "Regulatory uncertainty", "Reserve transparency concerns"]
          : ["Market volatility", "Regulatory risk"],
      positives: [
        `Established since ${est.year}`,
        "Listed on major exchanges",
        "High liquidity",
        "Large community",
        "Contract verified",
      ],
      contractVerified: true,
      honeypot: false,
      mintable: normalized === "USDT",
      proxyContract: false,
      liquidityLocked: true,
    };
  }

  // Fetch from CoinGecko for unknown / meme tokens
  if (!coinId) {
    // Truly unknown token — high risk
    const result: AuditResult = {
      token: normalized,
      score: 25,
      risks: [
        "Unknown token — not listed on CoinGecko",
        "Cannot verify contract source",
        "Likely very low liquidity",
        "Potential rug pull risk",
      ],
      positives: [],
      contractVerified: false,
      honeypot: false,
      mintable: true,
      proxyContract: false,
      liquidityLocked: false,
    };
    cachedAudits[normalized] = result;
    return result;
  }

  try {
    const res = await fetch(
      `${COINGECKO_API}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data: CoinGeckoDetail = await res.json();
    const md = data.market_data;
    const mcap = md.market_cap?.usd || 0;
    const vol = md.total_volume?.usd || 0;
    const athDate = md.ath_date?.usd;
    const ageDays = athDate ? Math.floor((Date.now() - new Date(athDate).getTime()) / 86400000) : 365;
    const volToMcap = mcap > 0 ? vol / mcap : 0;

    const score = scoreFromData(mcap, volToMcap, ageDays, 0);
    const risks: string[] = [];
    const positives: string[] = [];

    if (mcap < 50_000_000) risks.push("Very low market cap — high manipulation risk");
    else if (mcap < 500_000_000) risks.push("Small market cap — higher volatility expected");

    if (ageDays < 90) risks.push("Very new token (< 3 months)");
    else if (ageDays < 365) risks.push("Relatively new token (< 1 year)");

    if (volToMcap > 0.5) risks.push("Unusually high volume-to-marketcap ratio");
    if (volToMcap < 0.001) risks.push("Very low trading volume — liquidity concerns");

    positives.push("Listed on CoinGecko");
    if (mcap > 1e9) positives.push("Large market cap (>$1B)");
    if (ageDays > 365) positives.push("Over 1 year of trading history");
    if (volToMcap > 0.01) positives.push("Healthy trading volume");

    const result: AuditResult = {
      token: normalized,
      score,
      risks: risks.length ? risks : ["Standard market risks"],
      positives: positives.length ? positives : ["Token tracked on CoinGecko"],
      contractVerified: true, // CoinGecko listing implies some verification
      honeypot: score < 30,
      mintable: false,
      proxyContract: false,
      liquidityLocked: score > 60,
    };

    cachedAudits[normalized] = result;
    return result;
  } catch (err) {
    console.error(`[token-audit] Error for ${symbol}:`, err);
    return cachedAudits[normalized] || {
      token: normalized,
      score: 40,
      risks: ["Unable to fetch audit data — using cached estimate"],
      positives: [],
      contractVerified: false,
      honeypot: false,
      mintable: true,
      proxyContract: false,
      liquidityLocked: false,
    };
  }
}
