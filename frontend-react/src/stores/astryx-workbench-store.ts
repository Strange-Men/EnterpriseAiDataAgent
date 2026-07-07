import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AgentRun, AgentProviderRequested, AgentBusinessReport } from "@/services/api";

export interface BusinessAnalysisRecord {
  runId: string;
  question: string;
  tableName: string | null;
  answer: string;
  businessReport: AgentBusinessReport | null;
  findings: string[];
  evidencePreview: Record<string, unknown>[];
  sql: string | null;
  warnings: string[];
  nextSteps: string[];
  providerRequested: string | null;
  providerUsed: string | null;
  fallbackTriggered: boolean;
  fallbackReason: string | null;
  status: string;
  createdAt: string;
  rawRun: AgentRun;
}

interface AstryxWorkbenchState {
  provider: AgentProviderRequested;
  records: BusinessAnalysisRecord[];
  activeRunId: string | null;
  setProvider: (provider: AgentProviderRequested) => void;
  addRecord: (record: BusinessAnalysisRecord) => void;
  setActiveRunId: (runId: string | null) => void;
  getActiveRecord: () => BusinessAnalysisRecord | null;
}

const MAX_RECORDS = 20;

export const useAstryxWorkbenchStore = create<AstryxWorkbenchState>()(
  persist(
    (set, get) => ({
      provider: "mock",
      records: [],
      activeRunId: null,
      setProvider: (provider) => set({ provider }),
      addRecord: (record) =>
        set((state) => {
          const deduped = state.records.filter((item) => item.runId !== record.runId);
          return {
            records: [record, ...deduped].slice(0, MAX_RECORDS),
            activeRunId: record.runId,
          };
        }),
      setActiveRunId: (activeRunId) => set({ activeRunId }),
      getActiveRecord: () => {
        const state = get();
        return state.records.find((record) => record.runId === state.activeRunId) ?? state.records[0] ?? null;
      },
    }),
    {
      name: "astryx-business-analysis",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        provider: state.provider,
        records: state.records.slice(0, MAX_RECORDS),
        activeRunId: state.activeRunId,
      }),
    }
  )
);
