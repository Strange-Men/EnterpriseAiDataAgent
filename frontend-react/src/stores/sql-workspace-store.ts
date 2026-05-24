import { create } from "zustand";
import type { QueryResult } from "@/services/api";

interface SqlWorkspaceState {
  // SQL editor
  currentSql: string;
  setCurrentSql: (sql: string) => void;

  // Query execution
  isExecuting: boolean;
  queryResult: QueryResult | null;
  setExecuting: (executing: boolean) => void;
  setQueryResult: (result: QueryResult | null) => void;

  // Selected table
  selectedTable: string | null;
  setSelectedTable: (table: string | null) => void;

  // Active editor tab
  activeTab: "editor" | "history";
  setActiveTab: (tab: "editor" | "history") => void;
}

export const useSqlWorkspaceStore = create<SqlWorkspaceState>((set) => ({
  currentSql: "",
  setCurrentSql: (currentSql) => set({ currentSql }),

  isExecuting: false,
  queryResult: null,
  setExecuting: (isExecuting) => set({ isExecuting }),
  setQueryResult: (queryResult) => set({ queryResult }),

  selectedTable: null,
  setSelectedTable: (selectedTable) => set({ selectedTable }),

  activeTab: "editor",
  setActiveTab: (activeTab) => set({ activeTab }),
}));
