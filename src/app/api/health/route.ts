import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    agent: "CryptoSentry",
    version: "1.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    skills: 6,
  });
}
