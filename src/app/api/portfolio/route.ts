import { NextResponse } from "next/server";
import { getPortfolio, getAllocation } from "@/lib/portfolio/store";

export async function GET() {
  try {
    const portfolio = getPortfolio();
    const allocation = getAllocation();
    return NextResponse.json({ ...portfolio, allocation });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load portfolio", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
