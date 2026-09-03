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

    const userMsg: AgentMessage = {
      role: "user",
      content: msg,
      timestamp: Date.now(),
    };

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

      const assistantMsg: AgentMessage = {
        role: "assistant",
        content: data.message,
        timestamp: Date.now(),
        skillsUsed: data.skillsInvoked,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      let processed = line;
      processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
      processed = processed.replace(/`(.*?)`/g, '<code class="bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded text-xs font-mono border border-amber-500/20">$1</code>');
      processed = processed.replace(/_(.*?)_/g, '<em class="text-white/40 italic">$1</em>');

      return (
        <div
          key={i}
          className={`${line.startsWith("-") ? "ml-4" : ""} ${line.trim() === "" ? "h-2" : ""}`}
          dangerouslySetInnerHTML={{ __html: processed || "&nbsp;" }}
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold text-xs mr-3 mt-1 shrink-0 shadow-lg shadow-amber-500/20">
                S
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-white"
                  : "bg-white/[0.04] border border-white/[0.08] text-white/90"
              }`}
            >
              {renderContent(msg.content)}
              {msg.skillsUsed && msg.skillsUsed.length > 0 && (
                <div className="mt-3 pt-2 border-t border-white/[0.06] flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-white/30 self-center mr-1">Skills:</span>
                  {msg.skillsUsed.map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/80 border border-amber-500/20"
                    >
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold text-xs mr-3 mt-1 shrink-0 shadow-lg shadow-amber-500/20">
              S
            </div>
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-white/40 text-xs">Analyzing with Binance Skills...</span>
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
              className="text-xs px-4 py-2 rounded-full border border-white/10 text-white/50 hover:text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all flex items-center gap-1.5"
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
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-20 disabled:hover:from-amber-500 text-black font-semibold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
