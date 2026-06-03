import { create } from "zustand";
import type {
  TableInfo,
  QualityReport,
  UploadedFile,
  SystemStatus,
  DatasetMeta,
} from "@/types";
import { useAnalysisStore } from "@/stores/analysis-store";

interface DataState {
  // Database
  dbStatus: "idle" | "connected" | "error";
  tables: TableInfo[];
  setDbStatus: (status: "idle" | "connected" | "error") => void;
  setTables: (tables: TableInfo[]) => void;

  // Current data
  currentData: Record<string, unknown>[] | null;
  currentColumns: string[];
  setCurrentData: (data: Record<string, unknown>[] | null, columns?: string[]) => void;

  // Quality (per-table)
  qualityReports: Record<string, QualityReport>;
  qualityReport: QualityReport | null; // backward compat — reads from active table
  setQualityReport: (report: QualityReport | null, tableName?: string) => void;

  // Uploads
  uploadedFiles: UploadedFile[];
  setUploadedFiles: (files: UploadedFile[]) => void;

  // System status
  systemStatus: SystemStatus;
  setSystemStatus: (status: Partial<SystemStatus>) => void;

  // Dataset lifecycle
  getDatasetMeta: (table: string) => DatasetMeta;
}

export const useDataStore = create<DataState>((set, get) => ({
  dbStatus: "idle",
  tables: [],
  setDbStatus: (dbStatus) => set({ dbStatus }),
  setTables: (tables) => set({ tables }),

  currentData: null,
  currentColumns: [],
  setCurrentData: (currentData, columns) =>
    set({ currentData, currentColumns: columns ?? [] }),

  qualityReports: {},
  qualityReport: null,
  setQualityReport: (qualityReport, tableName) =>
    set((state) => {
      if (tableName && qualityReport) {
        const updated = { ...state.qualityReports, [tableName]: qualityReport };
        return { qualityReports: updated, qualityReport };
      }
      return { qualityReport };
    }),

  uploadedFiles: [],
  setUploadedFiles: (uploadedFiles) => set({ uploadedFiles }),

  systemStatus: {
    api: "unknown",
    db: "unknown",
    version: "...",
    uptime: "0:00:00",
  },
  setSystemStatus: (status) =>
    set((state) => ({ systemStatus: { ...state.systemStatus, ...status } })),

  getDatasetMeta: (table) => {
    const runs = useAnalysisStore.getState().runs;
    const tableRuns = runs.filter((r) => r.table === table);
    const analysisCount = tableRuns.length;
    let lastAnalyzedAt: string | null = null;
    if (tableRuns.length > 0) {
      const sorted = [...tableRuns].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      lastAnalyzedAt = sorted[0].timestamp;
    }
    const qualityScore = get().qualityReports[table]?.overallScore ?? null;
    return { table, uploadTime: null, analysisCount, lastAnalyzedAt, qualityScore };
  },
}));
