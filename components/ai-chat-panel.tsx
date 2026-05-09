"use client";

import { useState, useEffect, useRef } from "react";
import type { ChatMessage } from "@/types";
import type { Locale } from "@/app/lib/i18n";
import { t } from "@/app/lib/i18n";

export function AIChatPanel({ locale, showWelcome }: { locale: Locale; showWelcome: boolean }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.error }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t("chat.connectionError", locale) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (showWelcome) return null;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-6 w-14 h-14 bg-[#4A6741] hover:bg-[#3D5736] text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-all z-50"
      >
        🤖
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-6 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden" style={{ height: "28rem" }}>
      <div className="bg-gradient-to-r from-[#4A6741] to-[#5A7A4F] px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <p className="text-white font-bold text-sm">🤖 {t("chat.title", locale)}</p>
          <p className="text-[#c8dbbf] text-xs">{t("chat.subtitle", locale)}</p>
        </div>
        <button onClick={() => setOpen(false)} className="text-white text-xl hover:text-[#c8dbbf]">✕</button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <p className="text-gray-400 text-xs mb-3">{t("chat.examples", locale)}</p>
            {[t("chat.example1", locale), t("chat.example2", locale), t("chat.example3", locale)].map((q) => (
              <button
                key={q}
                onClick={() => { setInput(q); }}
                className="block w-full text-left text-xs text-[#4A6741] bg-[#E8F0E5] rounded-lg px-3 py-2 mb-1.5 hover:bg-[#d8eacf] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                msg.role === "user" ? "bg-[#4A6741] text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-400">{t("chat.thinking", locale)}</div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 px-3 py-2 shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("chat.placeholder", locale)}
            className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 focus:border-[#4A6741]/40 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-[#4A6741] hover:bg-[#3D5736] disabled:bg-[#8BAF7E] text-white text-sm px-3 py-2 rounded-xl transition-colors"
          >
            {t("chat.send", locale)}
          </button>
        </form>
      </div>
    </div>
  );
}
