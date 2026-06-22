import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { fetchQueryHistory } from "@/services/api";

export interface SqlHistoryEntry {
  id: string;
  type?: "sql" | "ai";
  sql: string;
  question?: string;
  tableName?: string;
  summary?: string;
  status: "success" | "error" | "partial";
  runtimeMs: number;
  rowCount: number;
  error: string | null;
  timestamp: string;
}

interface SqlHistoryState {
  history: SqlHistoryEntry[];
  searchQuery: string;
  filterStatus: "all" | "success" | "error";
  filterType: "all" | "sql" | "ai";
  isLoading: boolean;

  setHistory: (history: SqlHistoryEntry[]) => void;
  addEntry: (entry: SqlHistoryEntry) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: "all" | "success" | "error") => void;
  setFilterType: (type: "all" | "sql" | "ai") => void;
  getFiltered: () => SqlHistoryEntry[];
  exportHistory: () => string;
  fetchHistory: () => Promise<void>;
}

export const useSqlHistoryStore = create<SqlHistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      searchQuery: "",
      filterStatus: "all",
      filterType: "all",
      isLoading: false,

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

      setFilterType: (filterType) => set({ filterType }),

      getFiltered: () => {
        const { history, searchQuery, filterStatus, filterType } = get();
        let filtered = history;
        if (filterStatus !== "all") {
          filtered = filtered.filter((e) => e.status === filterStatus);
        }
        if (filterType !== "all") {
          filtered = filtered.filter((e) => (e.type || "sql") === filterType);
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter((e) =>
            e.sql.toLowerCase().includes(q) ||
            (e.question && e.question.toLowerCase().includes(q)) ||
            (e.summary && e.summary.toLowerCase().includes(q))
          );
        }
        return filtered;
      },

      exportHistory: () => {
        const { history } = get();
        return JSON.stringify(history, null, 2);
      },

      // Fetch history from backend (DuckDB persistence)
      // Merge strategy: backend SQL entries + local AI entries (never overwrite AI)
      fetchHistory: async () => {
        set({ isLoading: true });
        try {
          const backendHistory = await fetchQueryHistory(200);
          if (backendHistory && Array.isArray(backendHistory)) {
            const currentHistory = get().history;
            const localAiEntries = currentHistory.filter((e) => e.type === "ai");
            // Merge: backend SQL entries + preserved local AI entries, dedup by id
            const seenIds = new Set(backendHistory.map((e: SqlHistoryEntry) => e.id));
            const merged = [
              ...backendHistory,
              ...localAiEntries.filter((e) => !seenIds.has(e.id)),
            ];
            // Sort by timestamp descending (newest first)
            merged.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));
            set({ history: merged.slice(0, 200) });
          }
        } catch (error) {
          console.error("Failed to fetch history from backend:", error);
          // Fallback to localStorage data already loaded by persist middleware
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "sql-history",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persisted: unknown, version: number) => {
        if (!persisted || typeof persisted !== "object") return { history: [] };
        const p = persisted as Record<string, unknown>;
        if (version < 1) {
          return { history: Array.isArray(p.history) ? p.history : [] };
        }
        return persisted as { history: SqlHistoryEntry[] };
      },
      partialize: (state) => {
        const MAX_STORAGE_BYTES = 2 * 1024 * 1024; // 2MB limit for query history
        let history = state.history;

        // Truncate long SQL queries to save space
        history = history.map((entry) => ({
          ...entry,
          sql: entry.sql.length > 1000 ? entry.sql.slice(0, 1000) + "\n... [truncated]" : entry.sql,
          error: entry.error && entry.error.length > 500 ? entry.error.slice(0, 500) : entry.error,
        }));

        // Size guard: drop oldest entries if over limit
        const jsonSize = JSON.stringify(history).length;
        if (jsonSize > MAX_STORAGE_BYTES) {
          console.warn(
            `[sql-history-store] Persisted size ${(jsonSize / 1024 / 1024).toFixed(1)}MB exceeds 2MB limit, trimming oldest entries`
          );
          while (history.length > 50 && JSON.stringify(history).length > MAX_STORAGE_BYTES) {
            history.pop(); // drop oldest
          }
        }

        // Only persist history — not transient state (isLoading, searchQuery, filterStatus)
        return { history };
      },
    }
  )
);
