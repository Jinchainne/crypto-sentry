/**
 * Portfolio state management — tracks positions, cash, PnL.
 * Supports paper and live modes. In-memory with sync helpers.
 */

export interface Position {
  symbol: string;
  quantity: number;
  avgEntry: number;
  currentPrice: number;
  unrealizedPnl: number;
  side: "long" | "short";
  openedAt: number;
}

export interface PortfolioState {
  mode: "paper" | "live";
  cash: number;
  positions: Position[];
  closedTrades: ClosedTrade[];
  realizedPnl: number;
  totalValue: number;
  dailyPnl: number;
  dailyStartValue: number;
  lastUpdated: number;
}

export interface ClosedTrade {
  symbol: string;
  side: string;
  quantity: number;
  entry: number;
  exit: number;
  pnl: number;
  closedAt: number;
}

const INITIAL_CASH = 100_000;

let portfolio: PortfolioState = {
  mode: "paper",
  cash: INITIAL_CASH,
  positions: [],
  closedTrades: [],
  realizedPnl: 0,
  totalValue: INITIAL_CASH,
  dailyPnl: 0,
  dailyStartValue: INITIAL_CASH,
  lastUpdated: Date.now(),
};

export function getPortfolio(): PortfolioState {
  recalcTotalValue();
  return { ...portfolio };
}

export function getPortfolioMode(): "paper" | "live" {
  return portfolio.mode;
}

export function setPortfolioMode(mode: "paper" | "live") {
  portfolio.mode = mode;
}

export function addPosition(pos: Position) {
  portfolio.positions.push(pos);
  portfolio.lastUpdated = Date.now();
}

export function removePosition(symbol: string, exitPrice: number): ClosedTrade | null {
  const idx = portfolio.positions.findIndex((p) => p.symbol === symbol);
  if (idx === -1) return null;

  const pos = portfolio.positions[idx];
  portfolio.positions.splice(idx, 1);

  const pnl =
    pos.side === "long"
      ? (exitPrice - pos.avgEntry) * pos.quantity
      : (pos.avgEntry - exitPrice) * pos.quantity;

  const closed: ClosedTrade = {
    symbol: pos.symbol,
    side: pos.side,
    quantity: pos.quantity,
    entry: pos.avgEntry,
    exit: exitPrice,
    pnl,
    closedAt: Date.now(),
  };

  portfolio.closedTrades.push(closed);
  portfolio.realizedPnl += pnl;
  portfolio.cash += pos.quantity * exitPrice + (pos.side === "long" ? pnl : -pnl);
  portfolio.lastUpdated = Date.now();

  return closed;
}

export function updateCash(amount: number) {
  portfolio.cash += amount;
  portfolio.lastUpdated = Date.now();
}

export function updatePositionPrice(symbol: string, currentPrice: number) {
  const pos = portfolio.positions.find((p) => p.symbol === symbol);
  if (!pos) return;
  pos.currentPrice = currentPrice;
  pos.unrealizedPnl =
    pos.side === "long"
      ? (currentPrice - pos.avgEntry) * pos.quantity
      : (pos.avgEntry - currentPrice) * pos.quantity;
  portfolio.lastUpdated = Date.now();
}

export function getDailyLossPercent(): number {
  recalcTotalValue();
  if (portfolio.dailyStartValue === 0) return 0;
  return ((portfolio.dailyStartValue - portfolio.totalValue) / portfolio.dailyStartValue) * 100;
}

export function resetDaily() {
  recalcTotalValue();
  portfolio.dailyStartValue = portfolio.totalValue;
  portfolio.dailyPnl = 0;
}

function recalcTotalValue() {
  const positionsValue = portfolio.positions.reduce((sum, p) => {
    return sum + p.quantity * p.currentPrice;
  }, 0);
  portfolio.totalValue = portfolio.cash + positionsValue;
  portfolio.dailyPnl = portfolio.totalValue - portfolio.dailyStartValue;
}

export function getAllocation(): { symbol: string; percent: number; value: number }[] {
  recalcTotalValue();
  if (portfolio.totalValue === 0) return [];

  return portfolio.positions.map((p) => ({
    symbol: p.symbol,
    percent: ((p.quantity * p.currentPrice) / portfolio.totalValue) * 100,
    value: p.quantity * p.currentPrice,
  }));
}
