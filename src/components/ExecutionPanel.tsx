"use client";

import { useState } from "react";

interface TradePreview {
  symbol: string;
  side: string;
  quantity: number;
  estimatedPrice: number;
  estimatedCost: number;
  fees: number;
  slippage: number;
  totalCost: number;
  mode: string;
  warnings: string[];
}

interface RiskCheck {
  passed: boolean;
  checks: { name: string; passed: boolean; detail: string }[];
  warnings: string[];
}

export default function ExecutionPanel() {
  const [symbol, setSymbol] = useState("BTC");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("0.01");
  const [price, setPrice] = useState("65000");
  const [result, setResult] = useState<{
    preview?: TradePreview;
    risk?: RiskCheck;
    message?: string;
    action?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePreview() {
    setLoading(true);
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          side,
          quantity: parseFloat(quantity),
          price: parseFloat(price),
          mode: "paper",
          confirm: false,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ message: "Preview failed" });
    }
    setLoading(false);
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          side,
          quantity: parseFloat(quantity),
          price: parseFloat(price),
          mode: "paper",
          confirm: true,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ message: "Execution failed" });
    }
    setLoading(false);
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="icon-box">
            <span className="text-xs">⚡</span>
          </div>
          <h3 className="text-sm font-bold text-[#F5F0E8]">Execute Trade</h3>
        </div>
        <span className="pill-badge text-[10px]">PAPER</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-[10px] text-[#A8A09A] uppercase tracking-wider font-medium block mb-1">
            Symbol
          </label>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-[#F5F0E8] focus:border-[#E8610A] focus:outline-none"
            placeholder="BTC"
          />
        </div>
        <div>
          <label className="text-[10px] text-[#A8A09A] uppercase tracking-wider font-medium block mb-1">
            Side
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setSide("buy")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                side === "buy"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/[0.05] text-[#A8A09A] border border-white/[0.1]"
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setSide("sell")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                side === "sell"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-white/[0.05] text-[#A8A09A] border border-white/[0.1]"
              }`}
            >
              Sell
            </button>
          </div>
        </div>
        <div>
          <label className="text-[10px] text-[#A8A09A] uppercase tracking-wider font-medium block mb-1">
            Quantity
          </label>
          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            type="number"
            step="0.001"
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono focus:border-[#E8610A] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] text-[#A8A09A] uppercase tracking-wider font-medium block mb-1">
            Price ($)
          </label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            step="100"
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono focus:border-[#E8610A] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={handlePreview}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-white/[0.06] text-[#F5F0E8] border border-white/[0.1] hover:bg-white/[0.1] transition-all disabled:opacity-50"
        >
          {loading ? "Loading..." : "Preview"}
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#0E0804] transition-all disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #E8610A, #F5A020)",
          }}
        >
          {loading ? "Executing..." : "Execute"}
        </button>
      </div>

      {/* Risk Checks */}
      {result?.risk && (
        <div className="space-y-2 mb-3">
          <div className="text-[10px] text-[#A8A09A] uppercase tracking-wider font-medium">
            Risk Checks
          </div>
          {result.risk.checks.map((c) => (
            <div
              key={c.name}
              className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                c.passed
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : "bg-red-500/10 border border-red-500/20"
              }`}
            >
              <span className={c.passed ? "text-emerald-400" : "text-red-400"}>
                {c.passed ? "✅" : "❌"} {c.name}
              </span>
              <span className="text-[#A8A09A]">{c.detail}</span>
            </div>
          ))}
        </div>
      )}

      {/* Preview Summary */}
      {result?.preview && (
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05] space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-[#A8A09A]">Est. Price</span>
            <span className="text-[#F5F0E8] font-mono">
              ${result.preview.estimatedPrice.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#A8A09A]">Fees</span>
            <span className="text-[#F5F0E8] font-mono">
              ${result.preview.fees.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#A8A09A]">Slippage</span>
            <span className="text-[#F5F0E8] font-mono">
              {result.preview.slippage}%
            </span>
          </div>
          <div className="flex justify-between text-xs font-bold border-t border-white/[0.06] pt-1">
            <span className="text-[#A8A09A]">Total</span>
            <span className="text-[#F5F0E8] font-mono">
              ${result.preview.totalCost.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Execution Result */}
      {result?.message && (
        <div
          className={`mt-3 p-3 rounded-xl text-sm ${
            result.action === "executed"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : result.action === "blocked"
              ? "bg-red-500/10 border border-red-500/20 text-red-400"
              : "bg-white/[0.03] border border-white/[0.06] text-[#A8A09A]"
          }`}
        >
          {result.message}
        </div>
      )}
    </div>
  );
}
