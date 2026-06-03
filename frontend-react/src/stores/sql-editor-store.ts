/**
 * SQL Editor Store — unified query lifecycle ownership.
 *
 * Replaces: sql-workspace-store + query-tabs-store.
 *
 * Single source of truth for:
 *   - Query tabs (multi-tab SQL editor)
 *   - Current SQL (synced with active tab)
 *   - Query execution state (isExecuting, queryResult)
 *   - Pagination (offset, limit, hasMore, loadMore)
 *   - Selected table context
 *
 * Invariant: currentSql === activeTab.sql (always synced).
 *
 * Persisted to localStorage key "sql-editor".
 * Auto-migrates from legacy "query-tabs" key on first load.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { generateId } from "@/utils/id";
import type { QueryResult } from "@/services/api";
import { executeQuery } from "@/services/api";

// ── Types ───────────────────────────────────────────────────────────

export interface QueryTab {
  id: string;
  name: string;
  sql: string;
  createdAt: string;
}

const DEFAULT_TAB: QueryTab = {
  id: "tab-default",
  name: "Query 1",
  sql: "",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const LEGACY_KEY = "query-tabs";
const NEW_KEY = "sql-editor";

// ── Legacy migration (module-level, runs once) ──────────────────────

function migrateFromLegacy(): void {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;
    const p = parsed as Record<string, unknown>;
    if (!Array.isArray(p.tabs)) return;
    const tabs = (p.tabs as QueryTab[]).filter(
      (t) => t && typeof t === "object" && typeof t.id === "string"
    );
    if (tabs.length === 0) return;

    localStorage.setItem(NEW_KEY, JSON.stringify({
      state: {
        tabs,
        activeTabId: typeof p.activeTabId === "string" ? p.activeTabId : tabs[0].id,
      },
      version: 0,
    }));
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // Silently ignore
  }
}

// ── Migrate before store creation ───────────────────────────────────

migrateFromLegacy();

// ── Store interface ─────────────────────────────────────────────────

interface SqlEditorState {
  // Tabs (from query-tabs-store)
  tabs: QueryTab[];
  activeTabId: string;

  addTab: (name?: string, sql?: string) => string;
  removeTab: (id: string) => void;
  renameTab: (id: string, name: string) => void;
  setActiveTab: (id: string) => void;
  updateTabSql: (id: string, sql: string) => void;
  getActiveTab: () => QueryTab | undefined;

  // Current SQL (synced with active tab)
  currentSql: string;
  setCurrentSql: (sql: string) => void;

  // Query execution (from sql-workspace-store)
  isExecuting: boolean;
  queryResult: QueryResult | null;
  setExecuting: (executing: boolean) => void;
  setQueryResult: (result: QueryResult | null) => void;

  // Pagination
  offset: number;
  limit: number;
  totalRows: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => Promise<void>;
  resetPagination: () => void;

  // Panel tab (editor | history)
  activePanelTab: "editor" | "history";
  setActivePanelTab: (tab: "editor" | "history") => void;
}

// ── Store ───────────────────────────────────────────────────────────

export const useSqlEditorStore = create<SqlEditorState>()(
  persist(
    (set, get) => ({
      // Tabs
      tabs: [DEFAULT_TAB],
      activeTabId: DEFAULT_TAB.id,

      addTab: (name, sql) => {
        const id = generateId();
        const tab: QueryTab = {
          id,
          name: name || `Query ${get().tabs.length + 1}`,
          sql: sql || "",
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          tabs: [...state.tabs, tab],
          activeTabId: id,
          currentSql: sql || "",
        }));
        return id;
      },

      removeTab: (id) => {
        const { tabs, activeTabId } = get();
        if (tabs.length <= 1) return;
        const newTabs = tabs.filter((t) => t.id !== id);
        let newActiveId = activeTabId;
        if (activeTabId === id) {
          newActiveId = newTabs[newTabs.length - 1].id;
        }
        const newActiveTab = newTabs.find((t) => t.id === newActiveId);
        set({
          tabs: newTabs,
          activeTabId: newActiveId,
          currentSql: newActiveTab?.sql ?? "",
        });
      },

      renameTab: (id, name) => {
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === id ? { ...t, name } : t)),
        }));
      },

      setActiveTab: (id) => {
        const tab = get().tabs.find((t) => t.id === id);
        if (tab) {
          set({ activeTabId: id, currentSql: tab.sql });
        } else {
          set({ activeTabId: id });
        }
      },

      updateTabSql: (id, sql) => {
        set((state) => {
          const tabs = state.tabs.map((t) => (t.id === id ? { ...t, sql } : t));
          const currentSql = id === state.activeTabId ? sql : state.currentSql;
          return { tabs, currentSql };
        });
      },

      getActiveTab: () => {
        const { tabs, activeTabId } = get();
        return tabs.find((t) => t.id === activeTabId);
      },

      // Current SQL (synced with active tab)
      currentSql: "",
      setCurrentSql: (sql) => {
        const { activeTabId } = get();
        set((state) => ({
          currentSql: sql,
          tabs: state.tabs.map((t) => (t.id === activeTabId ? { ...t, sql } : t)),
        }));
      },

      // Query execution
      isExecuting: false,
      queryResult: null,
      setExecuting: (isExecuting) => set({ isExecuting }),
      setQueryResult: (queryResult) => {
        if (queryResult?.data) {
          const resultSize = JSON.stringify(queryResult.data).length;
          const MAX_RESULT_SIZE = 50 * 1024 * 1024;
          if (resultSize > MAX_RESULT_SIZE) {
            console.warn(
              `[sql-editor-store] Query result size ${(resultSize / 1024 / 1024).toFixed(1)}MB exceeds 50MB. ` +
              `Consider using server-side pagination (offset/limit) for large datasets.`
            );
          }
        }
        set({
          queryResult,
          offset: queryResult?.offset ?? 0,
          totalRows: queryResult?.totalRows ?? 0,
          hasMore: queryResult?.hasMore ?? false,
        });
      },

      // Pagination
      offset: 0,
      limit: 1000,
      totalRows: 0,
      hasMore: false,
      isLoadingMore: false,

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

      resetPagination: () => set({
        offset: 0,
        totalRows: 0,
        hasMore: false,
        isLoadingMore: false,
      }),

      // Panel tab
      activePanelTab: "editor" as const,
      setActivePanelTab: (activePanelTab) => set({ activePanelTab }),
    }),
    {
      name: NEW_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persisted: unknown, version: number) => {
        if (!persisted || typeof persisted !== "object") return {};
        const p = persisted as Record<string, unknown>;
        if (version < 1) {
          if (!Array.isArray(p.tabs)) return {};
          const tabs = (p.tabs as QueryTab[]).filter(
            (t) => t && typeof t === "object" && typeof t.id === "string"
          );
          if (tabs.length === 0) return {};
          const activeTabId = typeof p.activeTabId === "string" ? p.activeTabId : tabs[0].id;
          const activeTab = tabs.find((t) => t.id === activeTabId);
          return {
            tabs,
            activeTabId,
            currentSql: activeTab?.sql ?? "",
            activePanelTab: p.activePanelTab === "history" ? "history" : "editor",
          };
        }
        return p;
      },
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        activePanelTab: state.activePanelTab,
      }),
      onRehydrateStorage: () => (state) => {
        // Clear stale execution state from previous session
        if (state?.isExecuting) {
          state.isExecuting = false;
        }
      },
    }
  )
);
