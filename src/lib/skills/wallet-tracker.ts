import type { WalletInfo } from "../types";

// Simulated wallet data for demo - in production, this calls Binance Web3 API
const DEMO_WALLETS: Record<string, WalletInfo> = {
  "0xd8da6bf26964af9d7eed9e03e53415d37aa96045": {
    address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    chain: "Ethereum",
    balance: "1,247.83 ETH",
    tokens: [
      { symbol: "ETH", name: "Ethereum", balance: "1,247.83", value: "$3,892,450", price: "$3,118.50", change24h: 2.34 },
      { symbol: "USDT", name: "Tether", balance: "500,000", value: "$500,000", price: "$1.00", change24h: 0.01 },
      { symbol: "BNB", name: "BNB", balance: "320.5", value: "$192,300", price: "$600.00", change24h: -1.23 },
    ],
    lastActive: new Date(Date.now() - 300000).toISOString(),
    label: "Vitalik.eth",
  },
  "0x28c6c06298d514db089934071355e5743bf21d60": {
    address: "0x28c6c06298d514db089934071355e5743bf21d60",
    chain: "Ethereum",
    balance: "892.15 ETH",
    tokens: [
      { symbol: "ETH", name: "Ethereum", balance: "892.15", value: "$2,782,350", price: "$3,118.50", change24h: 2.34 },
      { symbol: "WBTC", name: "Wrapped Bitcoin", balance: "12.5", value: "$812,500", price: "$65,000", change24h: 1.56 },
    ],
    lastActive: new Date(Date.now() - 1800000).toISOString(),
    label: "Binance Hot Wallet",
  },
};

export async function trackWallet(address: string): Promise<WalletInfo | null> {
  // In production: call Binance Web3 API via binance-wallet-tracker skill
  const normalized = address.toLowerCase();
  if (DEMO_WALLETS[normalized]) {
    return DEMO_WALLETS[normalized];
  }
  // Generate mock data for unknown addresses
  return {
    address,
    chain: "Ethereum",
    balance: "45.2 ETH",
    tokens: [
      { symbol: "ETH", name: "Ethereum", balance: "45.2", value: "$140,956", price: "$3,118.50", change24h: 2.34 },
    ],
    lastActive: new Date().toISOString(),
  };
}

export async function getTopWallets(limit: number = 10): Promise<WalletInfo[]> {
  const wallets = Object.values(DEMO_WALLETS);
  return wallets.slice(0, limit);
}
