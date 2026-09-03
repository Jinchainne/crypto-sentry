export interface SkillConfig {
  name: string;
  description: string;
  category: "market" | "wallet" | "token" | "trading" | "social";
  endpoint: string;
  requiresAuth: boolean;
}

export interface AgentMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  skillsUsed?: string[];
}

export interface AgentResponse {
  message: string;
  data?: unknown;
  skillsInvoked: string[];
  confidence: number;
}

export interface WalletInfo {
  address: string;
  chain: string;
  balance: string;
  tokens: TokenBalance[];
  lastActive: string;
  label?: string;
}

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  value: string;
  price: string;
  change24h: number;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  price: string;
  change24h: number;
  change7d: number;
  marketCap: string;
  volume24h: string;
  holders: number;
  auditScore?: number;
  chain: string;
}

export interface TradingSignal {
  id: string;
  token: string;
  direction: "BUY" | "SELL" | "HOLD";
  confidence: number;
  price: string;
  target: string;
  stopLoss: string;
  reasoning: string;
  timestamp: string;
  source: string;
}

export interface MarketRankItem {
  rank: number;
  symbol: string;
  name: string;
  price: string;
  change24h: number;
  volume24h: string;
  marketCap: string;
}

export interface MemeToken {
  symbol: string;
  name: string;
  price: string;
  change1h: number;
  change24h: number;
  volume: string;
  liquidity: string;
  age: string;
  risk: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
}

export interface AuditResult {
  token: string;
  score: number;
  risks: string[];
  positives: string[];
  contractVerified: boolean;
  honeypot: boolean;
  mintable: boolean;
  proxyContract: boolean;
  liquidityLocked: boolean;
}
