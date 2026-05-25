import { create } from "zustand";
import type { QueryResult } from "@/services/api";
import { executeQuery } from "@/services/api";

interface SqlWorkspaceState {
  // SQL editor
  currentSql: string;
  setCurrentSql: (sql: string) => void;

  // Query execution
  isExecuting: boolean;
  queryResult: QueryResult | null;
  setExecuting: (executing: boolean) => void;
  setQueryResult: (result: QueryResult | null) => void;

  // Pagination state
  offset: number;
  limit: number;
  totalRows: number;
  hasMore: boolean;
  isLoadingMore: boolean;

  // Load more data
  loadMore: () => Promise<void>;

  // Selected table
  selectedTable: string | null;
  setSelectedTable: (table: string | null) => void;

  // Active editor tab
  activeTab: "editor" | "history";
  setActiveTab: (tab: "editor" | "history") => void;

  // Reset pagination
  resetPagination: () => void;
}

export const useSqlWorkspaceStore = create<SqlWorkspaceState>((set, get) => ({
  currentSql: "",
  setCurrentSql: (currentSql) => set({ currentSql }),

  isExecuting: false,
  queryResult: null,
  setExecuting: (isExecuting) => set({ isExecuting }),
  setQueryResult: (queryResult) => {
    const state = get();

    // Memory guard: warn if query result is too large
    if (queryResult?.data) {
      const resultSize = JSON.stringify(queryResult.data).length;
      const MAX_RESULT_SIZE = 50 * 1024 * 1024; // 50MB warning threshold
      if (resultSize > MAX_RESULT_SIZE) {
        console.warn(
          `[sql-workspace-store] Query result size ${(resultSize / 1024 / 1024).toFixed(1)}MB exceeds 50MB. ` +
          `Consider using server-side pagination (offset/limit) for large datasets.`
        );
      }
    }

    // Update pagination state when query result changes
    set({
      queryResult,
      offset: queryResult?.offset ?? 0,
      totalRows: queryResult?.totalRows ?? 0,
      hasMore: queryResult?.hasMore ?? false,
    });
  },

  // Pagination state
  offset: 0,
  limit: 10000,
  totalRows: 0,
  hasMore: false,
  isLoadingMore: false,

  // Load more data (append to existing result)
  loadMore: async () => {
    const state = get();
    if (!state.hasMore || state.isLoadingMore || !state.queryResult) return;

    set({ isLoadingMore: true });
    try {
      const newOffset = state.offset + state.limit;
      const result = await executeQuery(state.currentSql, newOffset, state.limit);
      if (result.status === "success") {
        const mergedData = [...(state.queryResult.data || []), ...result.data];
        set({
          queryResult: {
            ...state.queryResult,
            data: mergedData,
            rowCount: mergedData.length,
          },
          offset: newOffset,
          hasMore: result.hasMore ?? false,
          totalRows: result.totalRows ?? state.totalRows,
        });
      }
    } catch (error) {
      console.error("Failed to load more data:", error);
    } finally {
      set({ isLoadingMore: false });
    }
  },

  selectedTable: null,
  setSelectedTable: (selectedTable) => set({ selectedTable }),

  activeTab: "editor",
  setActiveTab: (activeTab) => set({ activeTab }),

  // Reset pagination when starting new query
  resetPagination: () => set({
    offset: 0,
    totalRows: 0,
    hasMore: false,
    isLoadingMore: false,
  }),
}));
