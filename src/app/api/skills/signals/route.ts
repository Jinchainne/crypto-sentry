import { NextResponse } from "next/server";
import { getSignals } from "@/lib/skills/trading-signal";

export async function GET() {
  try {
    const data = await getSignals();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch signals" }, { status: 500 });
  }
}