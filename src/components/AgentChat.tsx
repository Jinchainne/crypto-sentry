"use client";

import { useState, useRef, useEffect } from "react";
import type { AgentMessage } from "@/lib/types";

export default function AgentChat() {
  const [messages, setMessages] = useState<AgentMessage[]>(() => [
    {
      role: "assistant",
      content: `Welcome! I'm **CryptoSentry**, your AI crypto intelligence agent powered by **Binance Skills Hub**.\n\nI combine 6 skills into one conversational interface:\n\n🔍 **Token Info** — "What is SOL?"\n🛡️ **Security Audit** — "Audit PEPE"\n📈 **Trading Signals** — "Trading signals"\n🐋 **Wallet Tracking** — "Track wallet 0x..."\n🔥 **Meme Rush** — "What's trending?"\n📊 **Market Rankings** — "Top coins"\n🔬 **Full Analysis** — "Analyze SOL"\n\nTry one of the quick prompts below, or ask me anything about crypto!`,
      timestamp: 0,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg: AgentMessage = { role: "user", content: msg, timestamp: +new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.message,
        timestamp: +new Date(),
        skillsUsed: data.skillsInvoked,
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      let p = line;
      p = p.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#F5F0E8] font-semibold">$1</strong>');
      p = p.replace(/`(.*?)`/g, '<code class="bg-[rgba(232,97,10,0.12)] text-[#F5A020] px-1.5 py-0.5 rounded text-xs font-mono border border-[rgba(232,97,10,0.2)]">$1</code>');
      p = p.replace(/_(.*?)_/g, '<em class="text-[#A8A09A] italic">$1</em>');
      return (
        <div
          key={i}
          className={`${line.startsWith("-") ? "ml-4" : ""} ${line.trim() === "" ? "h-2" : ""}`}
          dangerouslySetInnerHTML={{ __html: p || "&nbsp;" }}
        />
      );
    });
  };

  const quickPrompts = [
    { label: "Market overview", icon: "📊" },
    { label: "Trading signals", icon: "📈" },
    { label: "What's trending?", icon: "🔥" },
    { label: "Analyze ETH", icon: "🔬" },
    { label: "Audit PEPE", icon: "🛡️" },
  ];

  return (
    <div className="chat-container flex flex-col" style={{ height: "min(75vh, 680px)" }}>
      {/* ── Header Bar ── */}
      <div className="chat-header shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#0E0804] font-bold text-xs animate-glow-pulse"
            style={{ background: "linear-gradient(135deg, #E8610A, #F5A020)" }}
          >
            S
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F5F0E8] leading-tight">
              CryptoSentry Agent
            </h3>
            <p className="text-[10px] text-[#A8A09A] leading-tight font-mono">
              Binance Skills Hub · 6 skills · v2.0
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)]">
            <div className="live-dot" style={{ width: 6, height: 6 }} />
            <span className="text-[10px] text-[#4ade80] font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            style={{ animation: `slide-up 0.4s cubic-bezier(.22,1,.36,1) ${i * 0.05}s both` }}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[#0E0804] font-bold text-xs mr-3 mt-1 shrink-0" style={{ background: "linear-gradient(135deg, #E8610A, #F5A020)" }}>
                S
              </div>
            )}
            <div className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user" ? "msg-user" : "msg-assistant"
            }`}>
              {renderContent(msg.content)}
              {msg.skillsUsed && msg.skillsUsed.length > 0 && (
                <div className="mt-3 pt-2 border-t border-white/[0.06] flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-[#A8A09A] self-center mr-1">Skills:</span>
                  {msg.skillsUsed.map((skill) => (
                    <span key={skill} className="pill-badge-orange text-[10px] py-0.5 px-2">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start" style={{ animation: "slide-up 0.3s ease both" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[#0E0804] font-bold text-xs mr-3 mt-1 shrink-0" style={{ background: "linear-gradient(135deg, #E8610A, #F5A020)" }}>
              S
            </div>
            <div className="msg-assistant px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
                <span className="text-[#A8A09A] text-xs font-mono">Analyzing with Binance Skills...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick prompts ── */}
      {messages.length <= 1 && (
        <div className="px-5 pb-4 flex flex-wrap gap-2 justify-center shrink-0 relative z-10">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt.label}
              onClick={() => sendMessage(prompt.label)}
              className="prompt-chip"
            >
              <span>{prompt.icon}</span>
              <span>{prompt.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div className="chat-input-area shrink-0 relative z-10">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about any token, wallet, or market trend..."
            className="chat-input"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="orange-btn text-sm !rounded-xl !px-6 flex items-center gap-2"
          >
            <span>Send</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
