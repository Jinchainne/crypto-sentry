<div align="center">

# 🛡️ CryptoSentry

### AI Crypto Intelligence Agent — Built on Binance Agent OS

An AI agent that tracks whale wallets, audits smart contracts, generates trading signals, and monitors meme tokens — all through natural language.

**Built for the [Binance Agent OS Mini Hackathon](https://binance.com) — Track A: Build an AI Agent with Agent OS**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Binance](https://img.shields.io/badge/Binance-Agent%20OS-F0B90B?style=flat-square&logo=binance)](https://github.com/binance/binance-skills-hub)

</div>

---

## What is CryptoSentry?

CryptoSentry is a **multi-skill AI agent** that orchestrates six Binance Skills Hub capabilities through a single conversational interface. Instead of switching between tools, you ask one agent — and it routes your query to the right skill(s), combines the results, and gives you a clear answer.

### The Problem

Crypto traders juggle multiple tools: wallet trackers, token auditors, signal providers, market aggregators. Context-switching wastes time and misses opportunities.

### The Solution

One agent. One chat. Six skills. Ask in plain English, get structured intelligence.

---

## 🎯 Features

| Feature | Skill Used | What It Does |
|---------|-----------|--------------|
| 🐋 **Wallet Tracking** | `binance-wallet-tracker` | Monitor whale wallets, balances, and token holdings |
| 🔍 **Token Info** | `query-token-info` | Price, market cap, holders, chain data |
| 🛡️ **Security Audit** | `query-token-audit` | Honeypot detection, mint risk, liquidity checks |
| 📈 **Trading Signals** | `binance-trading-signal` | AI signals with entry/target/stop-loss |
| 📊 **Market Rankings** | `crypto-market-rank` | Top coins by volume, cap, and performance |
| 🔥 **Meme Rush** | `meme-rush` | Trending meme tokens with risk ratings |

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/Jinchainne/crypto-sentry.git
cd crypto-sentry

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start chatting with the agent.

---

## 💬 How to Use

### Chat Interface (Home Page)

Just type natural language queries:

```
"What is SOL?"
"Is PEPE safe to buy?"
"Track wallet 0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
"Show me trading signals"
"What meme tokens are trending?"
"Analyze ETH"
"Market overview"
```

### Dashboard (`/dashboard`)

Real-time overview with:
- Market rankings table
- Active trading signals with confidence scores
- Meme token rush with risk indicators

### Signals (`/signals`)

Detailed view of all active trading signals with entry/target/stop-loss and AI reasoning.

### Wallets (`/wallets`)

Enter any wallet address to see holdings, balances, and 24h changes.

### Tokens (`/tokens`)

Token explorer with one-click security audits. Click any token to see its audit score, risks, and positives.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           Natural Language Input         │
├─────────────────────────────────────────┤
│         Intent Detection Engine          │
│   (entity extraction + classification)   │
├──────┬──────┬──────┬──────┬──────┬──────┤
│Wallet│Token │Token │Signal│Market│ Meme │
│Track │ Info │Audit │      │ Rank │ Rush │
├──────┴──────┴──────┴──────┴──────┴──────┤
│        Response Synthesizer              │
├─────────────────────────────────────────┤
│     Chat UI / Dashboard / REST API       │
└─────────────────────────────────────────┘
```

The agent detects intent from natural language, extracts entities (token symbols, wallet addresses), routes to one or more skills in parallel, and synthesizes a unified markdown response.

---

## 📡 API

### Chat with the Agent

```bash
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "What is ETH?"}]}'
```

### List Available Skills

```bash
curl http://localhost:3000/api/skills
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Skills:** Binance Skills Hub (6 skills integrated)
- **Architecture:** Skill-based agent with intent detection

---

## 📁 Project Structure

```
crypto-sentry/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Chat interface (home)
│   │   ├── dashboard/page.tsx    # Market dashboard
│   │   ├── signals/page.tsx      # Trading signals
│   │   ├── wallets/page.tsx      # Wallet tracker
│   │   ├── tokens/page.tsx       # Token explorer + audit
│   │   └── api/
│   │       ├── agent/route.ts    # Agent chat endpoint
│   │       ├── skills/route.ts   # Skills listing
│   │       └── health/route.ts   # Health check
│   ├── lib/
│   │   ├── agent.ts              # Core agent orchestration
│   │   ├── types.ts              # TypeScript interfaces
│   │   ├── utils.ts              # Utility functions
│   │   └── skills/
│   │       ├── index.ts          # Skill registry
│   │       ├── wallet-tracker.ts # Wallet tracking skill
│   │       ├── token-info.ts     # Token information skill
│   │       ├── token-audit.ts    # Security audit skill
│   │       ├── trading-signal.ts # Trading signals skill
│   │       ├── market-rank.ts    # Market rankings skill
│   │       └── meme-rush.ts      # Meme token tracking skill
│   └── components/
│       ├── Navbar.tsx            # Navigation bar
│       └── AgentChat.tsx         # Chat interface component
├── skills/
│   └── SKILL.md                  # Binance Skills Hub skill definition
├── docs/
│   └── ARCHITECTURE.md           # Architecture documentation
└── .env.example                  # Environment variables template
```

---

## 🏆 Binance Agent OS Mini Hackathon — Track A

This project is built for **Track A: Build an AI Agent with Agent OS** of the Binance Agent OS Mini Hackathon ($20K USDC prize pool).

### Why CryptoSentry?

1. **Multi-skill orchestration** — Not just one skill, but six working together
2. **Natural language interface** — Ask anything about crypto in plain English
3. **Production-ready architecture** — Clean separation of skills, agent, API, and UI
4. **Real utility** — Solves a real problem (tool fragmentation) for crypto traders
5. **Extensible** — Easy to add new skills from Binance Skills Hub

### Skills Hub Integration

CryptoSentry integrates six skills from the [Binance Skills Hub](https://github.com/binance/binance-skills-hub):

- `binance-wallet-tracker` — Wallet monitoring
- `query-token-info` — Token data
- `query-token-audit` — Security audits
- `binance-trading-signal` — Trading signals
- `crypto-market-rank` — Market rankings
- `meme-rush` — Meme token tracking

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with 🛡️ by [Jinchainne](https://github.com/Jinchainne)**

*We built Agent OS. You build what's next.* 🤝

</div>
