"use client";

import { useState, useRef, useEffect } from "react";
import type { AgentMessage } from "@/lib/types";

export default function AgentChat() {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      role: "assistant",
      content: `Welcome! I'm **CryptoSentry**, your AI crypto intelligence agent powered by **Binance Skills Hub**.\n\nI combine 6 skills into one conversational interface:\n\n🔍 **Token Info** — "What is SOL?"\n🛡️ **Security Audit** — "Audit PEPE"\n📈 **Trading Signals** — "Trading signals"\n🐋 **Wallet Tracking** — "Track wallet 0x..."\n🔥 **Meme Rush** — "What's trending?"\n📊 **Market Rankings** — "Top coins"\n🔬 **Full Analysis** — "Analyze SOL"\n\nTry one of the quick prompts below, or ask me anything about crypto!`,
      timestamp: Date.now(),
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

    const userMsg: AgentMessage = { role: "user", content: msg, timestamp: Date.now() };
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
        timestamp: Date.now(),
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
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0E0804] font-bold text-xs mr-3 mt-1 shrink-0 animate-glow-pulse" style={{ background: "linear-gradient(135deg, #E8610A, #F5A020)" }}>
                S
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-[rgba(232,97,10,0.12)] border border-[rgba(232,97,10,0.25)] text-[#F5F0E8]"
                : "glass-card text-[#F5F0E8]/90"
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
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0E0804] font-bold text-xs mr-3 mt-1 shrink-0 animate-glow-pulse" style={{ background: "linear-gradient(135deg, #E8610A, #F5A020)" }}>
              S
            </div>
            <div className="glass-card px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#E8610A] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-[#E8610A] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-[#F5A020] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-[#A8A09A] text-xs">Analyzing with Binance Skills...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2 justify-center">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt.label}
              onClick={() => sendMessage(prompt.label)}
              className="pill-badge hover:border-[rgba(232,97,10,0.3)] hover:text-[#E8610A] hover:bg-[rgba(232,97,10,0.08)] transition-all cursor-pointer"
            >
              <span>{prompt.icon}</span>
              <span>{prompt.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about any token, wallet, or market trend..."
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#F5F0E8] placeholder:text-[#A8A09A]/50 focus:outline-none focus:border-[rgba(232,97,10,0.4)] focus:ring-1 focus:ring-[rgba(232,97,10,0.2)] transition-all"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="orange-btn text-sm !rounded-xl !px-5"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
