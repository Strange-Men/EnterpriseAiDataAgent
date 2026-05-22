"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDataStore } from "@/stores/data-store";

export function ChatPanel() {
  const { t } = useTranslation();
  const { chatHistory, addChatMessage } = useDataStore();
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    addChatMessage({ role: "user", content: input, timestamp: new Date().toISOString() });
    addChatMessage({
      role: "assistant",
      content: `Mock reply to: **${input.slice(0, 80)}**\n\n${t("chat.mock-reply")}`,
      timestamp: new Date().toISOString(),
    });
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider pb-2 border-b border-[var(--border-default)] mb-3">
        {t("nav.chat")}
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {chatHistory.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">{t("chat.empty")}</p>
        )}
        {chatHistory.map((msg, i) => (
          <div
            key={i}
            className={`px-3 py-2 rounded-lg text-sm ${
              msg.role === "user"
                ? "bg-[var(--bg-tertiary)] ml-8"
                : "bg-[var(--bg-secondary)] border border-[var(--border-default)] mr-8"
            }`}
          >
            <p className="text-xs text-[var(--text-muted)] mb-1">
              {msg.role === "user" ? "You" : "AI"}
            </p>
            {msg.content}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={t("chat.placeholder")}
          className="flex-1 px-3 py-2 text-sm bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-md focus:border-[var(--accent)] focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 text-sm bg-[var(--accent)] text-[var(--bg-primary)] rounded-md hover:bg-[var(--accent-hover)] transition-colors font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}
