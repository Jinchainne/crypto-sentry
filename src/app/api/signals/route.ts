import { NextResponse } from "next/server";
import { buildSignals } from "@/lib/signals";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bundle = await buildSignals();
    return NextResponse.json(bundle);
  } catch (error) {
    console.error("[/api/signals] Error:", error);
    return NextResponse.json(
      { error: "Failed to build signals", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 },
    );
  }
}
