---
title: CryptoSentry Agent
description: An AI crypto intelligence agent that combines wallet tracking, token auditing, trading signals, and market analysis through natural language interaction.
metadata:
  version: 1.0.0
  author: Jinchainne
license: MIT
---

# CryptoSentry Agent

An AI-powered crypto intelligence agent built on Binance Agent OS that orchestrates multiple Binance Skills Hub capabilities through a unified natural language interface.

## What It Does

CryptoSentry combines six Binance Skills Hub skills into a single conversational agent:

1. **Wallet Tracker** — Monitor whale wallets, track balances, and detect accumulation/distribution patterns
2. **Token Info** — Get real-time token data including price, market cap, holders, and chain info
3. **Token Audit** — Security analysis for smart contracts: honeypot detection, mint risk, liquidity checks
4. **Trading Signal** — AI-generated signals with entry/target/stop-loss based on multi-skill analysis
5. **Market Rank** — Live market rankings by volume, market cap, and price performance
6. **Meme Rush** — Track trending meme tokens with risk assessment

## How It Works

The agent uses an intent-detection system to route natural language queries to the appropriate skill(s):

```
User: "Is PEPE safe to buy?"
Agent: [token-audit] + [trading-signal] → Combined security + signal response
```

```
User: "What are the top movers today?"
Agent: [market-rank] + [meme-rush] → Market overview with trending tokens
```

## Architecture

```
┌─────────────────────────────────────────┐
│           Natural Language Input         │
├─────────────────────────────────────────┤
│         Intent Detection Engine          │
├──────┬──────┬──────┬──────┬──────┬──────┤
│Wallet│Token │Token │Signal│Market│ Meme │
│Track │ Info │Audit │      │ Rank │ Rush │
├──────┴──────┴──────┴──────┴──────┴──────┤
│        Response Synthesizer              │
├─────────────────────────────────────────┤
│     Chat UI / Dashboard / API            │
└─────────────────────────────────────────┘
```

## Usage

### As a Chat Agent
Ask anything about crypto in natural language:
- "What is SOL?"
- "Audit PEPE"
- "Track wallet 0xd8da6bf..."
- "Show me trading signals"
- "What meme tokens are trending?"
- "Analyze ETH"

### As a Dashboard
Navigate to `/dashboard` for a real-time overview of market data, signals, and meme tokens.

### As an API
```bash
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "What is ETH?"}]}'
```

## Skills Used

| Skill | Category | Description |
|-------|----------|-------------|
| binance-wallet-tracker | wallet | Track wallet activities and balances |
| query-token-info | token | Token price, market cap, holders |
| query-token-audit | token | Smart contract security audit |
| binance-trading-signal | trading | AI trading signals |
| crypto-market-rank | market | Market rankings |
| meme-rush | social | Trending meme tokens |
