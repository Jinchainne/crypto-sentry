import { NextResponse } from "next/server";
import { getTopTokens } from "@/lib/skills/token-info";

export async function GET() {
  try {
    const data = await getTopTokens();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 });
  }
}