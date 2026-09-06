// LLM client — supports Groq (free), Xiaomi MiMo, OpenRouter, or any OpenAI-compatible API
// Set env vars: LLM_API_KEY + LLM_BASE_URL + LLM_MODEL
// Defaults to Groq free tier

const BASE_URL = process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1";
const API_KEY = process.env.LLM_API_KEY || "";
const MODEL = process.env.LLM_MODEL || "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are CryptoSentry, an AI crypto intelligence agent powered by Binance Skills Hub.

You have access to 6 skills:
1. Token Info — price, volume, supply, market data
2. Security Audit — smart-contract risk scoring, honeypot detection
3. Trading Signals — AI-generated buy/sell/hold signals
4. Wallet Tracking — monitor whale wallets in real-time
5. Meme Rush — trending meme coins with volume spikes
6. Market Rankings — top gainers, losers, trending tokens

Rules:
- Be concise, use markdown formatting
- Use emojis for visual clarity (📈📉🟢🔴⚠️✅)
- When discussing tokens, include price data if available
- For trading signals, always include risk disclaimer
- Keep responses under 500 tokens unless user asks for detail
- You can reference Binance Skills Hub as your data source`;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function callLLM(
  userMessage: string,
  context?: string
): Promise<string> {
  if (!API_KEY) {
    throw new Error("LLM_API_KEY not configured");
  }

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  if (context) {
    messages.push({
      role: "system",
      content: `Context from skills:\n${context}`,
    });
  }

  messages.push({ role: "user", content: userMessage });

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  // Support both content and reasoning_content (Xiaomi MiMo)
  const choice = data.choices?.[0]?.message;
  return choice?.content || choice?.reasoning_content || "No response from LLM.";
}
