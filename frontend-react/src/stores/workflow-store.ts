/**
 * @deprecated — Use investigation-store instead.
 *
 * Compatibility wrapper: auto-syncs from investigation-store.
 * All existing consumers continue to work unchanged.
 */

import { create } from "zustand";
import { useInvestigationStore, type InvestigationStage } from "./investigation-store";

export type WorkflowStage = InvestigationStage;

interface WorkflowState {
  stage: WorkflowStage;
  activeTable: string | null;
  aiSql: string | null;
  startedAt: string | null;
  source: "upload" | "manual" | null;
  advance: (stage: WorkflowStage, opts?: { table?: string; sql?: string }) => void;
  reset: () => void;
}

function snapshot(): WorkflowState {
  const s = useInvestigationStore.getState();
  return {
    stage: s.stage,
    activeTable: s.activeTable,
    aiSql: s.lastSql,
    startedAt: s.startedAt,
    source: s.source,
    advance: (stage, opts) => s.advance(stage, opts),
    reset: () => s.reset(),
  };
}

export const useWorkflowStore = create<WorkflowState>(() => snapshot());

// Auto-sync: whenever investigation-store changes, push to this wrapper
useInvestigationStore.subscribe(() => {
  useWorkflowStore.setState(snapshot(), true);
});
