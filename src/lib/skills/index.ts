import type { SkillConfig } from "../types";

export const SKILLS: Record<string, SkillConfig> = {
  "wallet-tracker": {
    name: "Wallet Tracker",
    description: "Track and monitor crypto wallet activities, balances, and transaction history",
    category: "wallet",
    endpoint: "/api/skills/wallet-tracker",
    requiresAuth: false,
  },
  "token-info": {
    name: "Token Info",
    description: "Get detailed token information including price, market cap, holders, and social metrics",
    category: "token",
    endpoint: "/api/skills/token-info",
    requiresAuth: false,
  },
  "token-audit": {
    name: "Token Audit",
    description: "Audit smart contracts for security risks, honeypots, and rug-pull indicators",
    category: "token",
    endpoint: "/api/skills/token-audit",
    requiresAuth: false,
  },
  "trading-signal": {
    name: "Trading Signal",
    description: "AI-powered trading signals with entry, target, and stop-loss levels",
    category: "trading",
    endpoint: "/api/skills/trading-signal",
    requiresAuth: false,
  },
  "market-rank": {
    name: "Market Rank",
    description: "Real-time crypto market rankings by price, volume, and market cap",
    category: "market",
    endpoint: "/api/skills/market-rank",
    requiresAuth: false,
  },
  "meme-rush": {
    name: "Meme Rush",
    description: "Track trending meme tokens, new launches, and viral crypto narratives",
    category: "social",
    endpoint: "/api/skills/meme-rush",
    requiresAuth: false,
  },
};

export function getSkill(name: string): SkillConfig | undefined {
  return SKILLS[name];
}

export function getSkillsByCategory(category: string): SkillConfig[] {
  return Object.values(SKILLS).filter((s) => s.category === category);
}

export function getAllSkills(): SkillConfig[] {
  return Object.values(SKILLS);
}
