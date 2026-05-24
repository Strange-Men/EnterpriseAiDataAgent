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
        };
        set((state) => ({
          runs: [...state.runs, run].slice(-MAX_HISTORY),
          activeRunId: id,
        }));
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

      clearHistory: () => set({ runs: [], activeRunId: null }),
    }),
    {
      name: "analysis-history",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ...state,
        runs: state.runs.map((r) => ({
          ...r,
          // Keep section titles + truncated content for history display
          sections: r.sections.map((s) => ({
            ...s,
            content: s.content.length > 500 ? s.content.slice(-500) : s.content,
          })),
          // Keep chart metadata but drop data arrays (too large for localStorage)
          chartSpecs: r.chartSpecs.map((c) => ({
            ...c,
            data: [],
          })),
          // Keep multi-step summary + step metadata, drop row data
          multiResult: r.multiResult ? {
            ...r.multiResult,
            steps: r.multiResult.steps.map((s) => ({
              ...s,
              columns: s.columns,
              data: [],
            })),
          } : null,
          // Keep trace summary only, drop event details
          trace: r.trace ? {
            trace_id: r.trace.trace_id,
            total_llm_calls: r.trace.total_llm_calls,
            total_input_tokens: r.trace.total_input_tokens,
            total_output_tokens: r.trace.total_output_tokens,
            events: [],
            guardrail_violations: r.trace.guardrail_violations,
          } : null,
        })),
      }),
    }
  )
);
