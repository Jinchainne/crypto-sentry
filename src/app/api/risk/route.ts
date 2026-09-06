import { NextResponse } from "next/server";
import { getRiskMetrics } from "@/lib/risk";

export async function GET() {
  try {
    const metrics = getRiskMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load risk metrics", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
