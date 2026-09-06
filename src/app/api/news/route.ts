import { NextResponse } from "next/server";
import { getProvider } from "@/lib/sosovalue";
import { computeSentimentSignal } from "@/lib/signals/sentiment";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const provider = getProvider();
    const news = await provider.getNews({ category: 1, pageSize: 50 });
    const sentiment = computeSentimentSignal(news);

    const items = news.map((item) => ({
      id: item.id,
      title: item.title,
      releaseTime: item.releaseTime,
      matchedSymbols: item.matchedSymbols,
      tags: item.tags,
      engagement: item.engagement,
      sentiment: sentiment.perAsset[item.matchedSymbols[0]] ?? 0,
    }));

    return NextResponse.json({ items, overallSentiment: sentiment.score });
  } catch (error) {
    console.error("[/api/news] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 },
    );
  }
}
