import { NextRequest, NextResponse } from "next/server";
import { routeOrder } from "@/lib/execution/router";
import { previewTrade } from "@/lib/execution/preview";
import { runRiskChecks } from "@/lib/risk";
import { addPosition, updateCash, getPortfolio } from "@/lib/portfolio/store";
import type { TradeRequest } from "@/lib/execution/router";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symbol, side, quantity, price, orderType, mode, confirm } = body as TradeRequest & {
      confirm?: boolean;
    };

    if (!symbol || !side || !quantity || !price) {
      return NextResponse.json(
        { error: "Missing required fields: symbol, side, quantity, price" },
        { status: 400 }
      );
    }

    const tradeReq: TradeRequest = {
      symbol: symbol.toUpperCase(),
      side,
      quantity,
      price,
      orderType,
      mode: mode || "paper",
    };

    // Always preview first
    const preview = previewTrade(tradeReq);

    // Run risk checks
    const riskCheck = runRiskChecks(tradeReq);

    if (!confirm) {
      return NextResponse.json({
        action: "preview",
        preview,
        risk: riskCheck,
        message: riskCheck.passed
          ? "Trade preview ready. Send with `confirm: true` to execute."
          : "Trade blocked by risk checks. Review and adjust.",
      });
    }

    // Check risk before confirming
    if (!riskCheck.passed) {
      return NextResponse.json(
        {
          action: "blocked",
          preview,
          risk: riskCheck,
          message: "Trade blocked by risk management. Adjust quantity or wait.",
        },
        { status: 403 }
      );
    }

    // Execute with adjusted quantity if risk check modified it
    const finalReq = {
      ...tradeReq,
      quantity: riskCheck.adjustedQuantity || tradeReq.quantity,
    };

    const result = await routeOrder(finalReq);

    // Update paper portfolio
    if (result.mode === "paper" && result.status === "filled") {
      const portfolio = getPortfolio();
      const cost = result.quantity * result.avgPrice;

      if (side === "buy") {
        updateCash(-cost - result.fees);
        addPosition({
          symbol: result.symbol,
          quantity: result.quantity,
          avgEntry: result.avgPrice,
          currentPrice: result.avgPrice,
          unrealizedPnl: 0,
          side: "long",
          openedAt: Date.now(),
        });
      } else {
        updateCash(cost - result.fees);
      }
    }

    return NextResponse.json({
      action: "executed",
      result,
      preview,
      risk: riskCheck,
      message: `✅ ${side.toUpperCase()} ${result.quantity} ${symbol.toUpperCase()} @ $${result.avgPrice} (${result.mode} mode)`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Execution failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
