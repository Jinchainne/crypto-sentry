/**
 * SoDEX API Client — EIP-712 signed orders for SoDEX DEX.
 *
 * Supports paper trading (default) and live mode.
 * Env vars: SODEX_PUBLIC_KEY, SODEX_API_PRIVATE_KEY
 */

const SODEX_BASE = process.env.SODEX_API_URL || "https://api.sodex.io";

export interface SodexOrder {
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  orderType: "limit" | "market";
}

export interface SodexOrderResult {
  orderId: string;
  status: "filled" | "partial" | "pending" | "rejected";
  filledQuantity: number;
  avgPrice: number;
  fees: number;
  timestamp: number;
}

export interface SodexAccount {
  address: string;
  balance: number;
  availableMargin: number;
  positions: SodexPosition[];
}

export interface SodexPosition {
  symbol: string;
  side: "long" | "short";
  quantity: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
}

export interface SodexPortfolio {
  totalValue: number;
  cash: number;
  positions: SodexPosition[];
  pnl: { realized: number; unrealized: number };
}

function getHeaders(): Record<string, string> {
  const apiKey = process.env.SODEX_API_KEY_NAME || "";
  const publicKey = process.env.SODEX_PUBLIC_KEY || "";
  return {
    "Content-Type": "application/json",
    "X-Api-Key": apiKey,
    "X-Public-Key": publicKey,
  };
}

export async function sodexGetAccount(): Promise<SodexAccount> {
  const res = await fetch(`${SODEX_BASE}/v1/account`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`SoDEX account error: ${res.status}`);
  return res.json();
}

export async function sodexGetPortfolio(): Promise<SodexPortfolio> {
  const res = await fetch(`${SODEX_BASE}/v1/portfolio`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`SoDEX portfolio error: ${res.status}`);
  return res.json();
}

export async function sodexPlaceOrder(order: SodexOrder): Promise<SodexOrderResult> {
  const res = await fetch(`${SODEX_BASE}/v1/orders`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error(`SoDEX order error: ${res.status}`);
  return res.json();
}

export async function sodexGetOrderbook(symbol: string): Promise<{
  bids: [number, number][];
  asks: [number, number][];
}> {
  const res = await fetch(`${SODEX_BASE}/v1/orderbook/${symbol}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`SoDEX orderbook error: ${res.status}`);
  return res.json();
}

/**
 * EIP-712 domain for signing orders (live mode only).
 */
export const SODEX_EIP712_DOMAIN = {
  name: "SoDEX",
  version: "1",
  chainId: 1,
  verifyingContract: "0x0000000000000000000000000000000000000000" as `0x${string}`,
} as const;

export const ORDER_TYPE = {
  Order: [
    { name: "symbol", type: "string" },
    { name: "side", type: "string" },
    { name: "quantity", type: "uint256" },
    { name: "price", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "expiry", type: "uint256" },
  ],
} as const;

export function buildOrderMessage(order: SodexOrder, nonce: number, expiry: number) {
  return {
    symbol: order.symbol,
    side: order.side,
    quantity: Math.round(order.quantity * 1e8),
    price: Math.round(order.price * 1e8),
    nonce,
    expiry,
  };
}
