"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useTemplateStore, type AnalysisTemplate, type TemplateStep } from "@/stores/template-store";
import { useDataStore } from "@/stores/data-store";
import { aiAdaptTemplate } from "@/services/api";
import type { TableColumn } from "@/types";

interface AdaptedQuestion {
  order: number;
  question: string;
  status: "ok" | "unadaptable";
  reason?: string;
}

export function ApplyTemplateDialog({
  onClose,
  onApply,
}: {
  onClose: () => void;
  onApply: (steps: TemplateStep[], targetTable: string) => void;
}) {
  const { t } = useTranslation();
  const templates = useTemplateStore((s) => s.templates);
  const tables = useDataStore((s) => s.tables);
  const deleteTemplate = useTemplateStore((s) => s.deleteTemplate);

  const [selectedTemplate, setSelectedTemplate] = useState<AnalysisTemplate | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [adaptedQuestions, setAdaptedQuestions] = useState<AdaptedQuestion[]>([]);
  const [adapting, setAdapting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdapt = async () => {
    if (!selectedTemplate || !selectedTable) return;
    setAdapting(true);
    setError(null);
    try {
      const targetTableInfo = tables.find((t) => t.name === selectedTable);
      const targetColumns = (targetTableInfo?.columns ?? []).map((c: TableColumn) => ({
        name: c.name,
        dtype: c.dtype,
      }));
      const originalColumns = targetColumns; // Use target schema as reference

      const result = await aiAdaptTemplate(
        selectedTemplate.steps,
        originalColumns,
        selectedTable,
        targetColumns
      );
      setAdaptedQuestions(result.adapted_questions);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Adaptation failed");
    }
    setAdapting(false);
  };

  const handleApply = () => {
    if (!selectedTable) return;
    const steps: TemplateStep[] = adaptedQuestions
      .filter((q) => q.status === "ok")
      .map((q) => ({
        question: q.question,
        mode: selectedTemplate!.steps.find((s) => s.order === q.order)?.mode ?? "explain",
        order: q.order,
      }));
    if (steps.length === 0) return;
    onApply(steps, selectedTable);
    onClose();
  };

  // ESC to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg shadow-xl w-full max-w-lg p-4 space-y-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {t("template.apply")}
        </h3>

        {/* Step 1: Select template */}
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">
            {t("template.select")}
          </label>
          {templates.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">{t("template.no-templates")}</p>
          ) : (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => {
                    setSelectedTemplate(tpl);
                    setAdaptedQuestions([]);
                    setError(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                    selectedTemplate?.id === tpl.id
                      ? "bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)]"
                      : "bg-[var(--bg-primary)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent)]/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{tpl.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {t("template.steps-count", { count: tpl.steps.length })}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTemplate(tpl.id);
                          if (selectedTemplate?.id === tpl.id) setSelectedTemplate(null);
                        }}
                        className="text-[10px] text-[var(--text-muted)] hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Select target table */}
        {selectedTemplate && (
          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-1">
              {t("template.select-table")}
            </label>
            <select
              value={selectedTable}
              onChange={(e) => {
                setSelectedTable(e.target.value);
                setAdaptedQuestions([]);
                setError(null);
              }}
              className="w-full px-3 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-default)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="">--</option>
              {tables.map((tbl) => (
                <option key={tbl.name} value={tbl.name}>
                  {tbl.name} ({tbl.rowCount.toLocaleString()} rows)
                </option>
              ))}
            </select>

            {selectedTable && adaptedQuestions.length === 0 && (
              <button
                onClick={handleAdapt}
                disabled={adapting}
                className="mt-2 px-3 py-1.5 text-xs bg-[var(--accent)]/10 text-[var(--accent)] rounded hover:bg-[var(--accent)]/20 transition-colors disabled:opacity-50"
              >
                {adapting ? t("template.adapting") : t("template.adapt")}
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Step 3: Show adapted questions */}
        {adaptedQuestions.length > 0 && (
          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-1">
              {t("template.adapted")}
            </label>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {adaptedQuestions.map((q) => (
                <div
                  key={q.order}
                  className={`px-2 py-1.5 text-xs rounded border ${
                    q.status === "ok"
                      ? "bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--text-secondary)]"
                      : "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
                  }`}
                >
                  <span className="font-bold text-[var(--accent)]">{q.order}.</span>{" "}
                  {q.question}
                  {q.status === "unadaptable" && q.reason && (
                    <span className="text-[10px] ml-2 opacity-70">({q.reason})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            {t("table.cancel")}
          </button>
          {adaptedQuestions.length > 0 && (
            <button
              onClick={handleApply}
              disabled={adaptedQuestions.filter((q) => q.status === "ok").length === 0}
              className="px-3 py-1.5 text-xs bg-[var(--accent)]/10 text-[var(--accent)] rounded hover:bg-[var(--accent)]/20 transition-colors disabled:opacity-50"
            >
              {t("template.run")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
