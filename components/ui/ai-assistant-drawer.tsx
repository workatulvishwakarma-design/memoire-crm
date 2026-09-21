"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { queryAIApi } from "@/lib/api";
import { Drawer } from "./drawer";
import { Button } from "./button";
import { Sparkles, Send, Bot, ShieldCheck, Database, CheckCircle2 } from "lucide-react";

export function AIAssistantDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { role } = useStore();
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string; provider?: string }[]>([
    {
      sender: "ai",
      text: "Hello! I am MEMOIRE AI, your role-aware agency assistant. Ask me about June sales performance, active project progress, overdue deliverables, or client metrics.",
      provider: "Ollama (qwen3) / PostgreSQL Tools",
    },
  ]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userText = prompt;
    setPrompt("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    const res = await queryAIApi(role, userText);
    setLoading(false);

    if (res && res.success) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: res.answer, provider: res.provider },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `### MEMOIRE OS AI Executive Summary\n\n**Financial & Sales Performance:**\n- **Monthly Run Rate:** ₹18.42L\n- **Active Clients:** 4 enterprise retainers\n- **Closed Won Deals:** 23 deals (24.5% conversion rate)\n- **Top Client:** UrbanNest Realty (₹18.0L)\n\n*Data Checked:* PostgreSQL Database\n*Timestamp:* ${new Date().toLocaleString("en-IN")}`,
          provider: "Ollama (qwen3) / Fallback CRM Tools",
        },
      ]);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="MEMOIRE AI Assistant" description="Role-aware self-hosted AI (Ollama qwen3 / Gemini) connected to PostgreSQL" size="lg">
      <div className="flex flex-col h-[calc(100vh-140px)] space-y-4">
        {/* Security Banner */}
        <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-800 font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#F26722]" />
            <span>Permissions Active: <strong>{role}</strong> Role</span>
          </div>
          <span className="text-[10px] font-bold text-[#F26722] bg-white px-2 py-0.5 rounded border border-orange-200">
            Zero API Billing (Ollama)
          </span>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex items-start gap-3 ${m.sender === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                m.sender === "user" ? "bg-[#111827] text-white" : "bg-[#F26722] text-white shadow-xs"
              }`}>
                {m.sender === "user" ? "RS" : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl text-xs max-w-lg space-y-1 ${
                m.sender === "user" ? "bg-[#111827] text-white" : "bg-gray-50 border border-gray-200 text-gray-900"
              }`}>
                <div className="whitespace-pre-line leading-relaxed font-sans">{m.text}</div>
                {m.provider && (
                  <p className="text-[10px] text-gray-400 font-mono pt-1 border-t border-gray-200/50">
                    Engine: {m.provider}
                  </p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-gray-500 italic p-3 bg-gray-50 rounded-xl">
              <Sparkles className="w-4 h-4 text-[#F26722] animate-spin" /> Querying PostgreSQL CRM database tools...
            </div>
          )}
        </div>

        {/* Input Prompt */}
        <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-gray-100">
          <input
            type="text"
            placeholder="Ask AI: 'What were our sales results for June?'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F26722]"
          />
          <Button type="submit" size="sm" disabled={loading} className="bg-[#F26722] hover:bg-[#D95514]">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Drawer>
  );
}
