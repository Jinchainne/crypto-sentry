## CryptoSentry — Replication Guide

### 1. Clone & Install
```bash
git clone https://github.com/Jinchainne/crypto-sentry.git
cd crypto-sentry && npm install
```

### 2. Environment Variables (.env.local)
```
LLM_API_KEY=gsk_your_groq_key          # Free at console.groq.com
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=openai/gpt-oss-120b
SOSOVALUE_API_KEY=your_key              # Free at sosovalue.com
```

### 3. Run
```bash
npm run dev    # http://localhost:3000
```

### 4. Deploy
```bash
npx vercel --prod
```
Set same env vars in Vercel Dashboard → Settings → Environment Variables.

### Architecture
- **Data:** CoinGecko (free, no key) + SoSoValue (ETF flows, news) + Etherscan (wallets)
- **Signals:** Regime detection (Risk-On/Off), narrative rotation, sentiment scoring
- **Agent:** Intent detection → 14 skills → LLM fallback (Groq free)
- **Execution:** Paper trading with risk checks, SoDEX EIP-712 ready
- **UI:** Next.js 16 + Tailwind CSS, dark theme, glass cards

### Key Commands
- "What is ETH?" → Token info (CoinGecko)
- "Buy 0.1 BTC" → Risk check → Paper trade
- "Market regime?" → SoSoValue signals → Risk-On/Off
- "Trading signals" → RSI-based signals
- "Portfolio" → Positions, PnL, allocation

### All APIs Free
Groq (LLM), CoinGecko (market), SoSoValue (flows/news), Etherscan (wallets) — no paid keys required.
