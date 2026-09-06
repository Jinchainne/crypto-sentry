import { NextResponse } from "next/server";
import { getMarketRank } from "@/lib/skills/market-rank";

export async function GET() {
  try {
    const data = await getMarketRank();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 });
  }
}
