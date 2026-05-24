/**
 * Workflow Store — tracks the MVP pipeline stage.
 *
 * ONLY stores: current stage, activeTable, aiSql, workflow metadata.
 * FORBIDDEN: query results, UI state, charts, exports, AI explanations, file blobs.
 * Those all live in their respective domain stores (data-store, sql-workspace-store, etc.).
 */

import { create } from "zustand";

export type WorkflowStage =
  | "idle"
  | "uploading"
  | "profiling"
  | "analyzing"
  | "sql-ready"
  | "executing"
  | "done";

interface WorkflowState {
  stage: WorkflowStage;
  activeTable: string | null;
  aiSql: string | null;
  startedAt: string | null;
  source: "upload" | "manual" | null;

  /** Advance to a new stage. Pass table/sql to set them alongside. */
  advance: (stage: WorkflowStage, opts?: { table?: string; sql?: string }) => void;

  /** Reset to idle (start a new workflow). */
  reset: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  stage: "idle",
  activeTable: null,
  aiSql: null,
  startedAt: null,
  source: null,

  advance: (stage, opts) =>
    set((state) => ({
      stage,
      activeTable: opts?.table ?? state.activeTable,
      aiSql: opts?.sql ?? state.aiSql,
      startedAt: state.startedAt ?? new Date().toISOString(),
      source:
        state.source ?? (stage === "uploading" ? "upload" : "manual"),
    })),

  reset: () =>
    set({
      stage: "idle",
      activeTable: null,
      aiSql: null,
      startedAt: null,
      source: null,
    }),
}));
