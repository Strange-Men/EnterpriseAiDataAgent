import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
  searchQuery: string;
  filterStatus: "all" | "success" | "error";

  setHistory: (history: SqlHistoryEntry[]) => void;
  addEntry: (entry: SqlHistoryEntry) => void;
  removeEntry: (id: number) => void;
  clearHistory: () => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: "all" | "success" | "error") => void;
  getFiltered: () => SqlHistoryEntry[];
  exportHistory: () => string;
}

export const useSqlHistoryStore = create<SqlHistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      searchQuery: "",
      filterStatus: "all",

      setHistory: (history) => set({ history }),

      addEntry: (entry) =>
        set((state) => ({
          history: [entry, ...state.history].slice(0, 200),
        })),

      removeEntry: (id) =>
        set((state) => ({
          history: state.history.filter((e) => e.id !== id),
        })),

      clearHistory: () => set({ history: [] }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),

      setFilterStatus: (filterStatus) => set({ filterStatus }),

      getFiltered: () => {
        const { history, searchQuery, filterStatus } = get();
        let filtered = history;
        if (filterStatus !== "all") {
          filtered = filtered.filter((e) => e.status === filterStatus);
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter((e) => e.sql.toLowerCase().includes(q));
        }
        return filtered;
      },

      exportHistory: () => {
        const { history } = get();
        return JSON.stringify(history, null, 2);
      },
    }),
    { name: "sql-history", storage: createJSONStorage(() => localStorage) }
  )
);
