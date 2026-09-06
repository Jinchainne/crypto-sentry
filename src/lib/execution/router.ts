/**
 * Order Router — dispatches to paper or live execution.
 */

import type { SodexOrder, SodexOrderResult } from "./sodex";
import { sodexPlaceOrder } from "./sodex";

export interface TradeRequest {
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  orderType?: "limit" | "market";
  mode?: "paper" | "live";
}

export interface TradeResult {
  orderId: string;
  mode: "paper" | "live";
  status: "filled" | "partial" | "pending" | "rejected";
  symbol: string;
  side: string;
  quantity: number;
  avgPrice: number;
  fees: number;
  timestamp: number;
}

// Paper trading engine
const PAPER_FEE_RATE = 0.001; // 0.1%
let paperOrderSeq = 1000;

async function executePaper(req: TradeRequest): Promise<TradeResult> {
  const orderId = `PAPER-${++paperOrderSeq}`;
  const fees = req.quantity * req.price * PAPER_FEE_RATE;

  return {
    orderId,
    mode: "paper",
    status: "filled",
    symbol: req.symbol,
    side: req.side,
    quantity: req.quantity,
    avgPrice: req.price,
    fees,
    timestamp: Date.now(),
  };
}

async function executeLive(req: TradeRequest): Promise<TradeResult> {
  const order: SodexOrder = {
    symbol: req.symbol,
    side: req.side,
    quantity: req.quantity,
    price: req.price,
    orderType: req.orderType || "limit",
  };

  const result: SodexOrderResult = await sodexPlaceOrder(order);

  return {
    orderId: result.orderId,
    mode: "live",
    status: result.status,
    symbol: req.symbol,
    side: req.side,
    quantity: result.filledQuantity,
    avgPrice: result.avgPrice,
    fees: result.fees,
    timestamp: result.timestamp,
  };
}

export async function routeOrder(req: TradeRequest): Promise<TradeResult> {
  const mode = req.mode || "paper";

  if (mode === "live") {
    return executeLive(req);
  }
  return executePaper(req);
}
