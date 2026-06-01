"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useTemplateStore, type TemplateStep } from "@/stores/template-store";
import type { AnalysisRun } from "@/stores/analysis-store";

export function SaveTemplateDialog({
  run,
  onClose,
}: {
  run: AnalysisRun;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const addTemplate = useTemplateStore((s) => s.addTemplate);
  const [name, setName] = useState(run.question || run.mode);
  const [description, setDescription] = useState("");

  // Extract steps from the run
  const steps: TemplateStep[] = (() => {
    if (run.multiResult?.plan?.length) {
      return run.multiResult.plan.map((s, i) => ({
        question: s.purpose,
        mode: "autonomous" as const,
        order: i + 1,
      }));
    }
    return [{ question: run.question, mode: run.mode, order: 1 }];
  })();

  const handleSave = () => {
    if (!name.trim()) return;
    addTemplate(name.trim(), description.trim(), steps, run.id, run.table ?? "");
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
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg shadow-xl w-full max-w-md p-4 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {t("template.save-as")}
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-1">
              {t("template.name")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-default)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-1">
              {t("template.description")}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-default)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-1">
              {t("template.steps-count", { count: steps.length })}
            </label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {steps.map((step) => (
                <div
                  key={step.order}
                  className="px-2 py-1 text-[10px] bg-[var(--bg-primary)] border border-[var(--border-default)] rounded text-[var(--text-secondary)]"
                >
                  <span className="text-[var(--accent)] font-bold">{step.order}.</span>{" "}
                  {step.question}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            {t("table.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-3 py-1.5 text-xs bg-[var(--accent)]/10 text-[var(--accent)] rounded hover:bg-[var(--accent)]/20 transition-colors disabled:opacity-50"
          >
            {t("saved.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
