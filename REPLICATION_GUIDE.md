# CryptoSentry — Step-by-Step Replication Guide

## Overview
CryptoSentry is an autonomous crypto intelligence agent built on Next.js 16 with 14 integrated skills, real-time market data, regime detection, and paper trading execution.

---

## Step 1: Clone & Install

```bash
git clone https://github.com/Jinchainne/crypto-sentry.git
cd crypto-sentry
npm install
```

## Step 2: Set Environment Variables

Create `.env.local` with these keys:

```env
# LLM (Groq free tier — register at console.groq.com)
LLM_API_KEY=gsk_your_groq_key
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=openai/gpt-oss-120b

# SoSoValue (register at sosovalue.com)
SOSOVALUE_API_KEY=your_soso_key

# SoDEX (optional — for live execution)
SODEX_API_KEY_NAME=your_name
SODEX_PUBLIC_KEY=0xYourPublicKey
SODEX_API_PRIVATE_KEY=0xYourPrivateKey
```

## Step 3: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 — the agent is live.

## Step 4: Deploy to Vercel

```bash
npx vercel --prod
```

Set the same env vars in Vercel Dashboard → Settings → Environment Variables.

---

## Architecture (6 Layers)

### Layer 1: Data Sources
- **CoinGecko API** (free, no key) — market prices, volume, market cap
- **SoSoValue API** — ETF flows, news feeds, SSI sector indices
- **Etherscan API** (free) — wallet balances, token transfers

### Layer 2: Signal Processing (from Bellwether)
- `lib/signals/flows.ts` — ETF net-flow signal (BTC+ETH combined, z-score)
- `lib/signals/sentiment.ts` — Lexicon-based news sentiment scoring
- `lib/signals/volatility.ts` — Realized volatility from BTC daily closes
- `lib/signals/regime.ts` — Regime classifier (Risk-On/Neutral/Risk-Off)
- `lib/signals/narrative.ts` — Sector momentum ranking (7d+30d blend)

### Layer 3: Skills (6 autonomous skills)
- `lib/skills/market-rank.ts` — Top coins by market cap (CoinGecko)
- `lib/skills/token-info.ts` — Detailed token data (CoinGecko)
- `lib/skills/trading-signal.ts` — RSI-based signals from real price data
- `lib/skills/token-audit.ts` — Security audit heuristics
- `lib/skills/meme-rush.ts` — Trending meme tokens (CoinGecko)
- `lib/skills/wallet-tracker.ts` — Wallet balance (Etherscan)

### Layer 4: Agent Brain
- `lib/agent.ts` — Intent detection → skill routing → LLM fallback
- `lib/llm.ts` — Groq LLM client (OpenAI-compatible)
- Supports 14 intents: token-info, audit, signals, wallet, meme, market, regime, news, portfolio, trade, risk, analysis, general

### Layer 5: Execution (from BasisDesk/Bloom-AI)
- `lib/execution/sodex.ts` — SoDEX EIP-712 signed orders
- `lib/execution/router.ts` — Paper vs live order routing
- `lib/execution/preview.ts` — Pre-trade preview with fees/slippage
- `lib/portfolio/store.ts` — Portfolio state (positions, PnL, allocation)
- `lib/risk/sentinel.ts` — Pre-trade risk checks (size, loss, concentration)

### Layer 6: UI
- Premium dark theme with animated gradient mesh
- Glass cards with backdrop blur
- Live market ticker, signal cards, meme grid
- Chat interface with quick prompts
- Dashboard with portfolio panel and trade execution form

---

## Key Files

```
src/
├── app/
│   ├── page.tsx                    # Homepage (hero + features + chat)
│   ├── dashboard/page.tsx          # Dashboard (portfolio + markets + signals)
│   └── api/
│       ├── agent/route.ts          # Chat agent endpoint
│       ├── signals/route.ts        # Regime + narrative signals
│       ├── portfolio/route.ts      # Portfolio state
│       ├── execute/route.ts        # Trade execution
│       ├── risk/route.ts           # Risk metrics
│       └── skills/*/route.ts       # Market, signals, memes, tokens
├── components/
│   ├── AgentChat.tsx               # Chat interface
│   ├── Navbar.tsx                  # Navigation
│   ├── PortfolioPanel.tsx          # Portfolio display
│   ├── ExecutionPanel.tsx          # Trade form
│   └── MarketTicker.tsx            # Scrolling price ticker
└── lib/
    ├── agent.ts                    # Agent brain (intent → skill → response)
    ├── llm.ts                      # Groq LLM client
    ├── sosovalue/                  # SoSoValue API client
    ├── signals/                    # Signal processing layer
    ├── skills/                     # 6 autonomous skills
    ├── execution/                  # SoDEX execution layer
    ├── portfolio/                  # Portfolio management
    └── risk/                       # Risk sentinel
```

---

## How It Works (User Flow)

1. User opens homepage → sees live market data, signal preview, feature cards
2. User clicks "Launch Agent" → scrolls to chat interface
3. User types "What is ETH?" → agent routes to token-info skill → returns real data from CoinGecko
4. User types "Buy 0.1 BTC" → agent runs risk checks → shows trade preview → executes paper trade
5. User types "What is the regime?" → agent computes signals from SoSoValue → returns Risk-On/Off assessment
6. User visits dashboard → sees portfolio, market rankings, trading signals, meme tokens

---

## API Keys Needed

| Service | Key | Free? | Purpose |
|---------|-----|-------|---------|
| Groq | LLM_API_KEY | ✅ Free | AI chat responses |
| CoinGecko | None | ✅ Free | Market data |
| SoSoValue | SOSOVALUE_API_KEY | ✅ Free beta | ETF flows, news, indices |
| Etherscan | None | ✅ Free tier | Wallet tracking |
| SoDEX | SODEX keys | ✅ Testnet | Trade execution |

---

## Tech Stack

- **Framework:** Next.js 16.3.4 (App Router, Server Components)
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS v4
- **LLM:** Groq (openai/gpt-oss-120b, free)
- **Data:** CoinGecko + SoSoValue + Etherscan
- **Execution:** SoDEX (EIP-712 signed orders)
- **Deployment:** Vercel
