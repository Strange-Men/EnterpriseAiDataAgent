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
import type { AnomalyResult } from "@/types";

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

export type AnalysisMode = "explain" | "insights" | "charts" | "full-analysis" | "autonomous" | "anomalies";

export interface AnalysisSection {
  title: string;
  content: string;
  type: "markdown" | "sql" | "json";
}

export type RunStatus = "running" | "success" | "error";

export interface EvaluationResult {
  confidence: number;
  completeness: string;
  accuracy: string;
  actionability: string;
  diagnostics: string[];
  suggested_improvements: string[];
}

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
  evaluation?: EvaluationResult;
  anomalies?: AnomalyResult;
  drillDownFrom?: { runId: string; findingIndex: number; findingText: string };
}

// ── Store ─────────────────────────────────────────────────────────

interface AnalysisState {
  runs: AnalysisRun[];
  activeRunId: string | null;

  addRun: (mode: AnalysisMode, question: string, table?: string) => string;
  updateRun: (id: string, update: Partial<Pick<AnalysisRun, "status" | "sections" | "chartSpecs" | "multiResult" | "trace" | "error" | "anomalies" | "evaluation">>) => void;
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
  compareRuns: (idA: string, idB: string) => ComparisonResult | null;
  getEvolutionChain: (runId: string) => AnalysisRun[];
  importRuns: (runs: AnalysisRun[]) => void;
  drillDownRun: (sourceRunId: string, findingIndex: number, findingText: string) => string | null;
}

// ── Comparison types ────────────────────────────────────────────

export interface SectionDiff {
  title: string;
  change: "added" | "removed" | "changed" | "unchanged";
  old_content: string | null;
  new_content: string | null;
}

export interface MetricDelta {
  old: number;
  new: number;
  delta: number;
}

export interface ComparisonResult {
  run_a_id: string;
  run_b_id: string;
  summary: {
    sections_added: number;
    sections_removed: number;
    sections_changed: number;
    sections_unchanged: number;
    sql_changed: boolean;
  };
  sections_diff: SectionDiff[];
  metrics_diff: {
    tokens: MetricDelta;
    llm_calls: MetricDelta;
    row_count: MetricDelta;
  };
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

      compareRuns: (idA, idB) => {
        const { runs } = get();
        const runA = runs.find((r) => r.id === idA);
        const runB = runs.find((r) => r.id === idB);
        if (!runA || !runB) return null;

        // Section diff
        const titlesA = new Map(runA.sections.map((s) => [s.title, s]));
        const titlesB = new Map(runB.sections.map((s) => [s.title, s]));
        const allTitles = [...new Set([...titlesA.keys(), ...titlesB.keys()])];
        const sections_diff: ComparisonResult["sections_diff"] = allTitles.map((title) => {
          const inA = titlesA.has(title);
          const inB = titlesB.has(title);
          if (inA && !inB) return { title, change: "removed" as const, old_content: titlesA.get(title)!.content.slice(0, 500), new_content: null };
          if (!inA && inB) return { title, change: "added" as const, old_content: null, new_content: titlesB.get(title)!.content.slice(0, 500) };
          const oldC = titlesA.get(title)!.content.slice(0, 500);
          const newC = titlesB.get(title)!.content.slice(0, 500);
          return { title, change: oldC === newC ? "unchanged" as const : "changed" as const, old_content: oldC, new_content: newC };
        });

        // Metrics
        const traceA = runA.trace;
        const traceB = runB.trace;
        const tokensA = traceA?.total_output_tokens ?? 0;
        const tokensB = traceB?.total_output_tokens ?? 0;
        const callsA = traceA?.total_llm_calls ?? 0;
        const callsB = traceB?.total_llm_calls ?? 0;
        const rowsA = runA.multiResult?.steps?.reduce((s, st) => s + (st.row_count ?? 0), 0) ?? 0;
        const rowsB = runB.multiResult?.steps?.reduce((s, st) => s + (st.row_count ?? 0), 0) ?? 0;

        return {
          run_a_id: idA,
          run_b_id: idB,
          summary: {
            sections_added: sections_diff.filter((s) => s.change === "added").length,
            sections_removed: sections_diff.filter((s) => s.change === "removed").length,
            sections_changed: sections_diff.filter((s) => s.change === "changed").length,
            sections_unchanged: sections_diff.filter((s) => s.change === "unchanged").length,
            sql_changed: JSON.stringify(runA.multiResult?.steps?.map((s) => s.sql)) !== JSON.stringify(runB.multiResult?.steps?.map((s) => s.sql)),
          },
          sections_diff,
          metrics_diff: {
            tokens: { old: tokensA, new: tokensB, delta: tokensB - tokensA },
            llm_calls: { old: callsA, new: callsB, delta: callsB - callsA },
            row_count: { old: rowsA, new: rowsB, delta: rowsB - rowsA },
          },
        };
      },

      getEvolutionChain: (runId) => {
        const { runs } = get();
        // Walk up to root
        const chain: AnalysisRun[] = [];
        const visited = new Set<string>();
        let current: string | undefined = runId;
        while (current && !visited.has(current)) {
          visited.add(current);
          const run = runs.find((r) => r.id === current);
          if (!run) break;
          chain.unshift(run);
          current = run.parentRunId;
        }
        // Walk down to children
        const queue = [runId];
        while (queue.length > 0) {
          const parentId = queue.shift()!;
          const children = runs.filter((r) => r.parentRunId === parentId && !visited.has(r.id));
          for (const child of children) {
            visited.add(child.id);
            chain.push(child);
            queue.push(child.id);
          }
        }
        return chain.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      },

      importRuns: (importedRuns) => {
        const idMap = new Map<string, string>();
        set((state) => {
          const newRuns = importedRuns.map((r) => {
            const newId = generateId();
            idMap.set(r.id, newId);
            return {
              ...r,
              id: newId,
              parentRunId: r.parentRunId ? (idMap.get(r.parentRunId) ?? r.parentRunId) : undefined,
              saved: false,
              timestamp: new Date().toISOString(),
            };
          });
          let runs = [...state.runs, ...newRuns];
          // Enforce MAX_HISTORY: preserve saved runs
          if (runs.length > MAX_HISTORY) {
            const saved = runs.filter((r) => r.saved);
            const unsaved = runs.filter((r) => !r.saved);
            const slotsForUnsaved = Math.max(0, MAX_HISTORY - saved.length);
            runs = [...saved, ...unsaved.slice(-slotsForUnsaved)];
            runs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
          }
          return { runs };
        });
      },

      drillDownRun: (sourceRunId, findingIndex, findingText) => {
        const { runs, addRun } = get();
        const source = runs.find((r) => r.id === sourceRunId);
        if (!source) return null;
        const question = `Investigate further: ${findingText}`;
        const newId = addRun("autonomous", question, source.table);
        set((state) => ({
          runs: state.runs.map((r) =>
            r.id === newId
              ? {
                  ...r,
                  parentRunId: source.id,
                  version: 1,
                  drillDownFrom: { runId: sourceRunId, findingIndex, findingText },
                }
              : r
          ),
        }));
        return newId;
      },
    }),
    {
      name: "analysis-history",
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        const p = persisted as Record<string, unknown>;
        if (!Array.isArray(p.runs)) return current;
        return { ...current, runs: p.runs };
      },
      onRehydrateStorage: () => (state) => {
        if (state) state.recoverInterruptedRuns();
      },
      partialize: (state) => {
        const MAX_STORAGE_BYTES = 4 * 1024 * 1024; // 4MB
        let runs = state.runs.map((r) => {
          // Compress both saved and unsaved runs
          const compressRun = (run: typeof r) => ({
            ...run,
            sections: run.sections.map((s) => ({
              ...s,
              content: s.content.length > 500 ? s.content.slice(-500) : s.content,
            })),
            chartSpecs: run.chartSpecs.map((c) => ({
              ...c,
              // Keep max 100 data points per chart
              data: c.data.length > 100 ? c.data.slice(0, 100) : c.data,
            })),
            multiResult: run.multiResult ? {
              ...run.multiResult,
              steps: run.multiResult.steps.map((s) => ({
                ...s,
                // Keep max 50 rows per step
                data: s.data.length > 50 ? s.data.slice(0, 50) : s.data,
              })),
            } : null,
            trace: run.trace ? {
              trace_id: run.trace.trace_id,
              total_llm_calls: run.trace.total_llm_calls,
              total_input_tokens: run.trace.total_input_tokens,
              total_output_tokens: run.trace.total_output_tokens,
              events: run.trace.events.slice(-20), // Keep last 20 events
              guardrail_violations: run.trace.guardrail_violations,
            } : null,
          });

          return compressRun(r);
        });

        // Size guard: drop oldest runs if over limit
        const jsonSize = JSON.stringify({ ...state, runs }).length;
        if (jsonSize > MAX_STORAGE_BYTES) {
          console.warn(`[analysis-store] Persisted size ${(jsonSize / 1024 / 1024).toFixed(1)}MB exceeds 4MB limit, trimming oldest runs`);
          // Drop oldest runs first, regardless of saved status
          while (runs.length > 5 && JSON.stringify({ ...state, runs }).length > MAX_STORAGE_BYTES) {
            runs.shift(); // drop oldest
          }
        }
        return { ...state, runs };
      },
    }
  )
);
