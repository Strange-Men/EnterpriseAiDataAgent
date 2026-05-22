import { create } from "zustand";

export interface SqlHistoryEntry {
  id: number;
  sql: string;
  status: "success" | "error";
  runtimeMs: number;
  rowCount: number;
  error: string | null;
  timestamp: string;
}

interface SqlHistoryState {
  history: SqlHistoryEntry[];
  setHistory: (history: SqlHistoryEntry[]) => void;
  addEntry: (entry: SqlHistoryEntry) => void;
}

export const useSqlHistoryStore = create<SqlHistoryState>((set) => ({
  history: [],
  setHistory: (history) => set({ history }),
  addEntry: (entry) =>
    set((state) => ({ history: [entry, ...state.history].slice(0, 200) })),
}));
