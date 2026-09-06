import type { WalletInfo, TokenBalance } from "../types";

const COINGECKO_API = "https://api.coingecko.com/api/v3";
const ETH_PRICE_API = `${COINGECKO_API}/simple/price?ids=ethereum&vs_currencies=usd`;

async function getEthPrice(): Promise<number> {
  try {
    const res = await fetch(ETH_PRICE_API, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data = await res.json();
    return data.ethereum?.usd || 3000;
  } catch {
    return 3000;
  }
}

function formatUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function isValidEthAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

// Well-known labels
const KNOWN_LABELS: Record<string, string> = {
  "0xd8da6bf26964af9d7eed9e03e53415d37aa96045": "vitalik.eth",
  "0x28c6c06298d514db089934071355e5743bf21d60": "Binance Hot Wallet",
  "0x21a31ee1afc51d94c2efccaa2092ad1028285549": "Binance Cold Wallet",
  "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503": "Binance Wallet",
  "0x176f3dab24a159341c0509bb36b833e7fdd0a132": "Coinbase Commerce",
};

let cachedWallets: Record<string, WalletInfo> = {};

export async function trackWallet(address: string): Promise<WalletInfo | null> {
  const normalized = address.toLowerCase();

  if (!isValidEthAddress(address)) {
    return null;
  }

  // Return cached if recent
  if (cachedWallets[normalized]) {
    return cachedWallets[normalized];
  }

  try {
    const ethPrice = await getEthPrice();

    // Use Etherscan public API (no key required for basic balance, rate-limited)
    const balanceRes = await fetch(
      `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest`,
      { next: { revalidate: 60 } }
    );

    if (!balanceRes.ok) throw new Error(`Etherscan ${balanceRes.status}`);
    const balanceData = await balanceRes.json();

    let ethBalance = 0;
    if (balanceData.status === "1" && balanceData.result) {
      // Result is in wei
      ethBalance = parseFloat(balanceData.result) / 1e18;
    }

    const ethValue = ethBalance * ethPrice;

    const tokens: TokenBalance[] = [
      {
        symbol: "ETH",
        name: "Ethereum",
        balance: ethBalance.toFixed(4),
        value: formatUsd(ethValue),
        price: `$${ethPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change24h: 0,
      },
    ];

    // Try to get ERC-20 token transfers (limited info without API key)
    try {
      const tokenRes = await fetch(
        `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&page=1&offset=5&sort=desc`,
        { next: { revalidate: 60 } }
      );
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        if (tokenData.status === "1" && tokenData.result) {
          // Deduplicate recent token interactions
          const seen = new Set<string>();
          for (const tx of tokenData.result) {
            const sym = tx.tokenSymbol;
            if (sym && !seen.has(sym) && tokens.length < 6) {
              seen.add(sym);
              const decimals = parseInt(tx.tokenDecimal) || 18;
              tokens.push({
                symbol: sym.toUpperCase(),
                name: tx.tokenName || sym,
                balance: (parseFloat(tx.value) / Math.pow(10, decimals)).toFixed(4),
                value: "—",
                price: "—",
                change24h: 0,
              });
            }
          }
        }
      }
    } catch {
      // Token tx endpoint failed — that's fine, we have ETH balance
    }

    const wallet: WalletInfo = {
      address,
      chain: "Ethereum",
      balance: `${ethBalance.toFixed(4)} ETH`,
      tokens,
      lastActive: new Date().toISOString(),
      label: KNOWN_LABELS[normalized],
    };

    cachedWallets[normalized] = wallet;
    return wallet;
  } catch (err) {
    console.error("[wallet-tracker] Error:", err);
    // Return minimal data on failure
    return {
      address,
      chain: "Ethereum",
      balance: "—",
      tokens: [],
      lastActive: new Date().toISOString(),
      label: KNOWN_LABELS[normalized],
    };
  }
}

export async function getTopWallets(limit: number = 10): Promise<WalletInfo[]> {
  const topAddresses = Object.keys(KNOWN_LABELS).slice(0, limit);
  const wallets: WalletInfo[] = [];

  for (const addr of topAddresses) {
    const w = await trackWallet(addr);
    if (w) wallets.push(w);
  }

  return wallets;
}
