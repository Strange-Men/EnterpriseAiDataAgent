"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDataStore } from "@/stores/data-store";
import { useInvestigationStore } from "@/stores/investigation-store";
import { ModeSelector } from "./ai-mode-selector";
import type { AnalysisMode } from "@/stores/analysis-store";

interface QuestionInputProps {
  onStart: (question: string, table: string, mode: AnalysisMode) => void;
  isLoading: boolean;
}

export function QuestionInput({ onStart, isLoading }: QuestionInputProps) {
  const { t } = useTranslation();
  const tables = useDataStore((s) => s.tables);
  const activeTable = useInvestigationStore((s) => s.activeTable);

  const [question, setQuestion] = useState("");
  const [selectedTable, setSelectedTable] = useState(activeTable ?? "");
  const [mode, setMode] = useState<AnalysisMode>("autonomous");

  const handleSubmit = useCallback(() => {
    const q = question.trim();
    const table = selectedTable || tables[0]?.name;
    if (!q || !table || isLoading) return;
    onStart(q, table, mode);
  }, [question, selectedTable, mode, tables, isLoading, onStart]);

  const canSubmit = question.trim().length > 0 && (selectedTable || tables.length > 0) && !isLoading;

  return (
    <div className="space-y-3">
      {/* Question input */}
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder={t("inv.question-placeholder")}
        rows={2}
        className="w-full px-3 py-2 text-sm bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] resize-none"
        disabled={isLoading}
      />

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Table selector */}
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
            {t("inv.table-label")}
          </label>
          {tables.length > 0 ? (
            <select
              value={selectedTable || tables[0]?.name || ""}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="px-2 py-1 text-xs bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              disabled={isLoading}
            >
              {tables.map((tbl) => (
                <option key={tbl.name} value={tbl.name}>
                  {tbl.name} ({tbl.rowCount} rows)
                </option>
              ))}
            </select>
          ) : (
            <span className="text-[10px] text-[var(--text-muted)] italic">
              {t("inv.select-table-hint")}
            </span>
          )}
        </div>

        {/* Mode selector */}
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
            {t("inv.mode-label")}
          </label>
          <ModeSelector value={mode} onChange={setMode} />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="ml-auto px-4 py-1.5 text-xs bg-[var(--accent)] text-[var(--bg-primary)] rounded-md hover:opacity-90 transition-opacity font-medium disabled:opacity-40"
        >
          {isLoading ? t("inv.running") : t("inv.run")}
        </button>
      </div>
    </div>
  );
}
