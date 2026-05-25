/**
 * Analysis Store — persists analysis run history + trace data.
 *
 * Tracks each AI analysis execution with sections, charts, multi-step results,
 * and backend trace events. Persisted so history survives page refresh.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { generateId } from "@/utils/id";
import type { ChartSpec } from "@/components/ui/ai-chart";
import type { MultiStepResult } from "@/services/api";

const MAX_HISTORY = 20;

// ── Trace types (mirror backend TraceRecorder.to_dict()) ──────────

export interface TraceEvent {
  timestamp: string;
  operation: string;
  phase: string;
  prompt_name: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  status: "success" | "error";
  error?: string;
  sql?: string;
  step?: number;
}

export interface TraceSnapshot {
  trace_id: string;
  total_llm_calls: number;
  total_input_tokens: number;
  total_output_tokens: number;
  events: TraceEvent[];
  guardrail_violations: string[];
}

// ── Analysis run types ────────────────────────────────────────────

export type AnalysisMode = "explain" | "insights" | "charts" | "full-analysis" | "autonomous";

export interface AnalysisSection {
  title: string;
  content: string;
  type: "markdown" | "sql" | "json";
}

export type RunStatus = "running" | "success" | "error";

export interface AnalysisRun {
  id: string;
  mode: AnalysisMode;
  question: string;
  table?: string;
  timestamp: string;
  status: RunStatus;
  sections: AnalysisSection[];
  chartSpecs: ChartSpec[];
  multiResult: MultiStepResult | null;
  trace: TraceSnapshot | null;
  error?: string;
  saved: boolean;
  version: number;
  parentRunId?: string;
  notes?: string;
}

// ── Store ─────────────────────────────────────────────────────────

interface AnalysisState {
  runs: AnalysisRun[];
  activeRunId: string | null;

  addRun: (mode: AnalysisMode, question: string, table?: string) => string;
  updateRun: (id: string, update: Partial<Pick<AnalysisRun, "status" | "sections" | "chartSpecs" | "multiResult" | "trace" | "error">>) => void;
  setActiveRun: (id: string | null) => void;
  getActiveRun: () => AnalysisRun | null;
  clearHistory: () => void;
  saveRun: (id: string) => void;
  unsaveRun: (id: string) => void;
  deleteRun: (id: string) => void;
  rerunRun: (id: string) => string | null;
  exportRun: (id: string) => string | null;
  duplicateRun: (id: string) => string | null;
  updateRunNotes: (id: string, notes: string) => void;
  recoverInterruptedRuns: () => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      runs: [],
      activeRunId: null,

      addRun: (mode, question, table) => {
        const id = generateId();
        const run: AnalysisRun = {
          id,
          mode,
          question,
          table,
          timestamp: new Date().toISOString(),
          status: "running",
          sections: [],
          chartSpecs: [],
          multiResult: null,
          trace: null,
          saved: false,
          version: 1,
        };
        set((state) => {
          let runs = [...state.runs, run];
          // FIFO: trim to MAX_HISTORY but never evict saved runs
          if (runs.length > MAX_HISTORY) {
            const saved = runs.filter((r) => r.saved);
            const unsaved = runs.filter((r) => !r.saved);
            const slotsForUnsaved = Math.max(0, MAX_HISTORY - saved.length);
            runs = [...saved, ...unsaved.slice(-slotsForUnsaved)];
            // Sort by timestamp to maintain chronological order
            runs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
          }
          return { runs, activeRunId: id };
        });
        return id;
      },

      updateRun: (id, update) =>
        set((state) => ({
          runs: state.runs.map((r) => (r.id === id ? { ...r, ...update } : r)),
        })),

      setActiveRun: (id) => set({ activeRunId: id }),

      getActiveRun: () => {
        const { runs, activeRunId } = get();
        return runs.find((r) => r.id === activeRunId) ?? null;
      },

      clearHistory: () =>
        set((state) => ({
          runs: state.runs.filter((r) => r.saved),
          activeRunId: null,
        })),

      saveRun: (id) =>
        set((state) => ({
          runs: state.runs.map((r) => (r.id === id ? { ...r, saved: true } : r)),
        })),

      unsaveRun: (id) =>
        set((state) => ({
          runs: state.runs.map((r) => (r.id === id ? { ...r, saved: false } : r)),
        })),

      deleteRun: (id) =>
        set((state) => ({
          runs: state.runs.filter((r) => r.id !== id),
          activeRunId: state.activeRunId === id ? null : state.activeRunId,
        })),

      rerunRun: (id) => {
        const { runs, addRun } = get();
        const original = runs.find((r) => r.id === id);
        if (!original) return null;
        const newId = addRun(original.mode, original.question, original.table);
        set((state) => ({
          runs: state.runs.map((r) =>
            r.id === newId ? { ...r, version: original.version + 1, parentRunId: original.id } : r
          ),
        }));
        return newId;
      },

      exportRun: (id) => {
        const { runs } = get();
        const run = runs.find((r) => r.id === id);
        if (!run) return null;
        return JSON.stringify(run, null, 2);
      },

      duplicateRun: (id) => {
        const { runs, addRun } = get();
        const original = runs.find((r) => r.id === id);
        if (!original) return null;
        const newId = addRun(original.mode, original.question, original.table);
        set((state) => ({
          runs: state.runs.map((r) =>
            r.id === newId
              ? {
                  ...r,
                  parentRunId: original.id,
                  saved: false,
                  notes: undefined,
                }
              : r
          ),
        }));
        return newId;
      },

      updateRunNotes: (id, notes) =>
        set((state) => ({
          runs: state.runs.map((r) => (r.id === id ? { ...r, notes } : r)),
        })),

      recoverInterruptedRuns: () =>
        set((state) => ({
          runs: state.runs.map((r) =>
            r.status === "running"
              ? { ...r, status: "error" as RunStatus, error: "Session interrupted — run was not completed" }
              : r
          ),
        })),
    }),
    {
      name: "analysis-history",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const MAX_STORAGE_BYTES = 4 * 1024 * 1024; // 4MB
        let runs = state.runs.map((r) => {
          if (r.saved) return r; // Saved runs: full persistence
          // Unsaved runs: truncate heavy data
          return {
            ...r,
            sections: r.sections.map((s) => ({
              ...s,
              content: s.content.length > 500 ? s.content.slice(-500) : s.content,
            })),
            chartSpecs: r.chartSpecs.map((c) => ({ ...c, data: [] })),
            multiResult: r.multiResult ? {
              ...r.multiResult,
              steps: r.multiResult.steps.map((s) => ({ ...s, columns: s.columns, data: [] })),
            } : null,
            trace: r.trace ? {
              trace_id: r.trace.trace_id,
              total_llm_calls: r.trace.total_llm_calls,
              total_input_tokens: r.trace.total_input_tokens,
              total_output_tokens: r.trace.total_output_tokens,
              events: [],
              guardrail_violations: r.trace.guardrail_violations,
            } : null,
          };
        });
        // Size guard: drop oldest unsaved runs if over limit
        const jsonSize = JSON.stringify({ ...state, runs }).length;
        if (jsonSize > MAX_STORAGE_BYTES) {
          console.warn(`[analysis-store] Persisted size ${(jsonSize / 1024 / 1024).toFixed(1)}MB exceeds 4MB limit, trimming oldest unsaved runs`);
          const saved = runs.filter((r) => r.saved);
          const unsaved = runs.filter((r) => !r.saved).reverse(); // newest first
          while (unsaved.length > 0 && JSON.stringify({ ...state, runs: [...saved, ...unsaved] }).length > MAX_STORAGE_BYTES) {
            unsaved.pop(); // drop oldest
          }
          runs = [...saved, ...unsaved.reverse()];
          runs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        }
        return { ...state, runs };
      },
    }
  )
);
