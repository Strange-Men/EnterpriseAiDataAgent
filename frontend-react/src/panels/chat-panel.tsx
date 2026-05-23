"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDataStore } from "@/stores/data-store";
import { aiQuery } from "@/services/api";

export function ChatPanel() {
  const { t } = useTranslation();
  const { chatHistory, addChatMessage } = useDataStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const question = input.trim();

    addChatMessage({ role: "user", content: question, timestamp: new Date().toISOString() });
    setInput("");
    setIsLoading(true);

    try {
      const result = await aiQuery(question, true, true);

      if (result.status === "success") {
        let content = "";
        if (result.sql) {
          content += `**SQL:**\n\`\`\`sql\n${result.sql}\n\`\`\`\n\n`;
        }
        if (result.rowCount !== undefined) {
          content += `**Results:** ${result.rowCount} rows\n\n`;
        }
        if (result.explanation) {
          content += `**Analysis:**\n${result.explanation}`;
        }
        addChatMessage({
          role: "assistant",
          content: content || "Query executed successfully.",
          timestamp: new Date().toISOString(),
        });
      } else if (result.status === "cannot_answer") {
        addChatMessage({
          role: "assistant",
          content: `I can't answer this question with the available data.\n\n${result.error || ""}`,
          timestamp: new Date().toISOString(),
        });
      } else if (result.status === "sql_error") {
        addChatMessage({
          role: "assistant",
          content: `Generated SQL:\n\`\`\`sql\n${result.sql}\n\`\`\`\n\n**Error:** ${result.execution_error || result.error}`,
          timestamp: new Date().toISOString(),
        });
      } else {
        addChatMessage({
          role: "assistant",
          content: `Error: ${result.error || "Failed to process your question."}`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      addChatMessage({
        role: "assistant",
        content: `Connection error: ${err instanceof Error ? err.message : "Failed to reach AI service."}`,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider pb-2 border-b border-[var(--border-default)] mb-3">
        {t("nav.chat")}
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {chatHistory.length === 0 && (
          <div className="text-sm text-[var(--text-muted)] space-y-2">
            <p>{t("chat.empty")}</p>
            <p className="text-xs">Ask questions like:</p>
            <ul className="text-xs text-[var(--text-muted)] list-disc pl-4 space-y-1">
              <li>&quot;Show me the top 10 customers by revenue&quot;</li>
              <li>&quot;Analyze sales trends over time&quot;</li>
              <li>&quot;Which products have declining sales?&quot;</li>
            </ul>
          </div>
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
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="px-3 py-2 rounded-lg text-sm bg-[var(--bg-secondary)] border border-[var(--border-default)] mr-8">
            <p className="text-xs text-[var(--text-muted)] mb-1">AI</p>
            <span className="animate-pulse">Analyzing...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={isLoading ? "AI is thinking..." : t("chat.placeholder")}
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-sm bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-md focus:border-[var(--accent)] focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 text-sm bg-[var(--accent)] text-[var(--bg-primary)] rounded-md hover:bg-[var(--accent-hover)] transition-colors font-medium disabled:opacity-50"
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
