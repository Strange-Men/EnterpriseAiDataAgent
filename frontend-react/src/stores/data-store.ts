import { create } from "zustand";
import type {
  TableInfo,
  QualityReport,
  UploadedFile,
  SystemStatus,
} from "@/types";

interface DataState {
  // Database
  dbStatus: "idle" | "connected" | "error";
  tables: TableInfo[];
  setDbStatus: (status: "idle" | "connected" | "error") => void;
  setTables: (tables: TableInfo[]) => void;

  // Current data
  currentTable: string | null;
  currentData: Record<string, unknown>[] | null;
  currentColumns: string[];
  setCurrentTable: (table: string | null) => void;
  setCurrentData: (data: Record<string, unknown>[] | null, columns?: string[]) => void;

  // Quality
  qualityReport: QualityReport | null;
  setQualityReport: (report: QualityReport | null) => void;

  // Uploads
  uploadedFiles: UploadedFile[];
  setUploadedFiles: (files: UploadedFile[]) => void;

  // System status
  systemStatus: SystemStatus;
  setSystemStatus: (status: Partial<SystemStatus>) => void;
}

export const useDataStore = create<DataState>((set) => ({
  dbStatus: "idle",
  tables: [],
  setDbStatus: (dbStatus) => set({ dbStatus }),
  setTables: (tables) => set({ tables }),

  currentTable: null,
  currentData: null,
  currentColumns: [],
  setCurrentTable: (currentTable) => set({ currentTable }),
  setCurrentData: (currentData, columns) =>
    set({ currentData, currentColumns: columns ?? [] }),

  qualityReport: null,
  setQualityReport: (qualityReport) => set({ qualityReport }),

  uploadedFiles: [],
  setUploadedFiles: (uploadedFiles) => set({ uploadedFiles }),

  systemStatus: {
    api: "unknown",
    db: "unknown",
    version: "0.3.3",
    uptime: "0:00:00",
  },
  setSystemStatus: (status) =>
    set((state) => ({ systemStatus: { ...state.systemStatus, ...status } })),
}));
