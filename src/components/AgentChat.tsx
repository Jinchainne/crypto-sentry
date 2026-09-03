"use client";

import { useState, useRef, useEffect } from "react";
import type { AgentMessage } from "@/lib/types";

export default function AgentChat() {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      role: "assistant",
      content: `I'm **CryptoSentry**, your AI crypto intelligence agent powered by Binance Skills Hub.\n\nHere's what I can help with:\n\n🔍 **Token Info** — "What is SOL?"\n🛡️ **Security Audit** — "Audit PEPE"\n📈 **Trading Signals** — "Trading signals"\n🐋 **Wallet Tracking** — "Track wallet 0x..."\n🔥 **Meme Rush** — "What's trending?"\n📊 **Market Rankings** — "Top coins"\n🔬 **Full Analysis** — "Analyze SOL"\n\nJust ask me anything about crypto!`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: AgentMessage = {
      role: "user",
      content: input.trim(),
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
    // Simple markdown-like rendering
    return content.split("\n").map((line, i) => {
      let processed = line;
      // Bold
      processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Code
      processed = processed.replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded text-amber-300">$1</code>');
      // Italic
      processed = processed.replace(/_(.*?)_/g, '<em class="text-white/50">$1</em>');

      return (
        <div
          key={i}
          className={line.startsWith("-") ? "ml-4" : ""}
          dangerouslySetInnerHTML={{ __html: processed || "&nbsp;" }}
        />
      );
    });
  };

  const quickPrompts = [
    "Market overview",
    "Trading signals",
    "What's trending?",
    "Analyze ETH",
    "Audit PEPE",
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
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-amber-500/20 border border-amber-500/30 text-white"
                  : "bg-white/5 border border-white/10 text-white/90"
              }`}
            >
              {renderContent(msg.content)}
              {msg.skillsUsed && msg.skillsUsed.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-1">
                  {msg.skillsUsed.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300"
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
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white/50">
              <span className="animate-pulse">Analyzing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setInput(prompt);
              }}
              className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/50 hover:text-white hover:border-amber-500/50 hover:bg-amber-500/10 transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about any token, wallet, or market trend..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 text-black font-medium rounded-xl text-sm transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
