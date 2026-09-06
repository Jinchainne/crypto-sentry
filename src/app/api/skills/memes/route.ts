import { NextResponse } from "next/server";
import { getMemeRush } from "@/lib/skills/meme-rush";

export async function GET() {
  try {
    const data = await getMemeRush();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch memes" }, { status: 500 });
  }
}