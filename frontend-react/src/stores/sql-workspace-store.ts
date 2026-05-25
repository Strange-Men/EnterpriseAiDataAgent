/**
 * @deprecated — Use sql-editor-store instead.
 *
 * Compatibility wrapper: auto-syncs from sql-editor-store.
 * All existing consumers continue to work unchanged.
 */

import { create } from "zustand";
import { useSqlEditorStore } from "./sql-editor-store";
import type { QueryResult } from "@/services/api";

interface SqlWorkspaceState {
  currentSql: string;
  setCurrentSql: (sql: string) => void;

  isExecuting: boolean;
  queryResult: QueryResult | null;
  setExecuting: (executing: boolean) => void;
  setQueryResult: (result: QueryResult | null) => void;

  offset: number;
  limit: number;
  totalRows: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => Promise<void>;

  selectedTable: string | null;
  setSelectedTable: (table: string | null) => void;

  activeTab: "editor" | "history";
  setActiveTab: (tab: "editor" | "history") => void;

  resetPagination: () => void;
}

function snapshot(): SqlWorkspaceState {
  const s = useSqlEditorStore.getState();
  return {
    currentSql: s.currentSql,
    setCurrentSql: (sql) => s.setCurrentSql(sql),

    isExecuting: s.isExecuting,
    queryResult: s.queryResult,
    setExecuting: (executing) => s.setExecuting(executing),
    setQueryResult: (result) => s.setQueryResult(result),

    offset: s.offset,
    limit: s.limit,
    totalRows: s.totalRows,
    hasMore: s.hasMore,
    isLoadingMore: s.isLoadingMore,
    loadMore: () => s.loadMore(),

    selectedTable: s.selectedTable,
    setSelectedTable: (table) => s.setSelectedTable(table),

    activeTab: s.activePanelTab,
    setActiveTab: (tab) => s.setActivePanelTab(tab),

    resetPagination: () => s.resetPagination(),
  };
}

export const useSqlWorkspaceStore = create<SqlWorkspaceState>(() => snapshot());

useSqlEditorStore.subscribe(() => {
  useSqlWorkspaceStore.setState(snapshot(), true);
});
