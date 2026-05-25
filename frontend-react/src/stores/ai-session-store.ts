/**
 * @deprecated — Use investigation-store instead.
 *
 * Compatibility wrapper: auto-syncs from investigation-store.
 * All existing consumers continue to work unchanged.
 */

import { create } from "zustand";
import { useInvestigationStore, type AiTurn, type AiContextForApi } from "./investigation-store";

export type { AiTurn };

interface AiSessionState {
  turns: AiTurn[];
  activeTable: string | null;
  lastColumns: string[] | null;
  lastRowCount: number | null;
  lastSql: string | null;
  lastInsightSummary: string | null;
  compressedSummary: string | null;
  keyFindings: string[];
  investigationSummary: string | null;

  addUserTurn: (content: string) => void;
  addAssistantTurn: (content: string, sql?: string) => void;
  setContext: (ctx: { table?: string; columns?: string[]; rowCount?: number }) => void;
  getRecentTurns: (max?: number) => AiTurn[];
  getContextForApi: () => AiContextForApi;
  addKeyFinding: (finding: string) => void;
  setInvestigationSummary: (summary: string) => void;
  getContextForInsights: () => string | null;
  getContextForPlan: () => string[] | null;
  clear: () => void;
}

function snapshot(): AiSessionState {
  const s = useInvestigationStore.getState();
  return {
    turns: s.turns,
    activeTable: s.activeTable,
    lastColumns: s.lastColumns,
    lastRowCount: s.lastRowCount,
    lastSql: s.lastSql,
    lastInsightSummary: s.lastInsightSummary,
    compressedSummary: s.compressedSummary,
    keyFindings: s.keyFindings,
    investigationSummary: s.investigationSummary,
    addUserTurn: (content) => s.addUserTurn(content),
    addAssistantTurn: (content, sql) => s.addAssistantTurn(content, sql),
    setContext: (ctx) => s.setContext(ctx),
    getRecentTurns: (max) => s.getRecentTurns(max),
    getContextForApi: () => s.getContextForApi(),
    addKeyFinding: (finding) => s.addKeyFinding(finding),
    setInvestigationSummary: (summary) => s.setInvestigationSummary(summary),
    getContextForInsights: () => s.getContextForInsights(),
    getContextForPlan: () => s.getContextForPlan(),
    clear: () => s.clear(),
  };
}

export const useAiSessionStore = create<AiSessionState>(() => snapshot());

useInvestigationStore.subscribe(() => {
  useAiSessionStore.setState(snapshot(), true);
});
