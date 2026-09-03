# Architecture

CryptoSentry is a Next.js application that serves as an AI crypto intelligence agent built on Binance Agent OS.

## Layers

1. **Skill Layer (`src/lib/skills/`)** — Individual skill modules that wrap Binance Skills Hub capabilities. Each skill is a standalone module with typed interfaces.

2. **Agent Layer (`src/lib/agent.ts`)** — The core orchestration engine. Receives natural language input, detects intent, routes to appropriate skill(s), and synthesizes a unified response.

3. **API Layer (`src/app/api/`)** — Next.js API routes that expose the agent and skills as REST endpoints.

4. **UI Layer (`src/app/` + `src/components/`)** — Next.js App Router pages with a chat interface, dashboard, and dedicated views for signals, wallets, and tokens.

## Data Flow

```
User Input → Intent Detection → Skill Invocation(s) → Response Synthesis → UI Render
```

The agent processes messages through:
1. **Entity extraction** — Pull out token symbols, wallet addresses
2. **Intent classification** — Map to one of 7 intents (wallet-track, token-audit, trading-signal, meme-rush, market-rank, token-info, full-analysis)
3. **Multi-skill orchestration** — Some intents trigger multiple skills in parallel
4. **Response formatting** — Markdown-formatted responses with structured data

## Skill Integration

Each skill module in `src/lib/skills/` follows the same pattern:
- Typed interfaces matching the Binance Skills Hub data format
- Async functions that can be swapped with real API calls
- Currently uses demo data; production version calls Binance Web3 APIs

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** React hooks (useState, useEffect)
- **API:** Next.js API routes (REST)
