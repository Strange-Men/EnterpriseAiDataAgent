import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { generateId } from "@/utils/id";

export interface QueryTab {
  id: string;
  name: string;
  sql: string;
  createdAt: string;
}

interface QueryTabsState {
  tabs: QueryTab[];
  activeTabId: string;

  addTab: (name?: string, sql?: string) => string;
  removeTab: (id: string) => void;
  renameTab: (id: string, name: string) => void;
  setActiveTab: (id: string) => void;
  updateTabSql: (id: string, sql: string) => void;
  getActiveTab: () => QueryTab | undefined;
}

const DEFAULT_TAB: QueryTab = {
  id: "tab-default",
  name: "Query 1",
  sql: "",
  createdAt: "2026-01-01T00:00:00.000Z",
};

export const useQueryTabsStore = create<QueryTabsState>()(
  persist(
    (set, get) => ({
      tabs: [DEFAULT_TAB],
      activeTabId: DEFAULT_TAB.id,

      addTab: (name?: string, sql?: string) => {
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
        }));
        return id;
      },

      removeTab: (id: string) => {
        const { tabs, activeTabId } = get();
        if (tabs.length <= 1) return; // keep at least one tab

        const newTabs = tabs.filter((t) => t.id !== id);
        let newActiveId = activeTabId;
        if (activeTabId === id) {
          newActiveId = newTabs[newTabs.length - 1].id;
        }
        set({ tabs: newTabs, activeTabId: newActiveId });
      },

      renameTab: (id: string, name: string) => {
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === id ? { ...t, name } : t)),
        }));
      },

      setActiveTab: (id: string) => {
        set({ activeTabId: id });
      },

      updateTabSql: (id: string, sql: string) => {
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === id ? { ...t, sql } : t)),
        }));
      },

      getActiveTab: () => {
        const { tabs, activeTabId } = get();
        return tabs.find((t) => t.id === activeTabId);
      },
    }),
    {
      name: "query-tabs",
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        const p = persisted as Record<string, unknown>;
        if (!Array.isArray(p.tabs)) return current;
        const tabs = p.tabs.filter(
          (t: unknown) => t && typeof t === "object" && typeof (t as Record<string, unknown>).id === "string"
        );
        if (tabs.length === 0) return current;
        return { ...current, tabs, activeTabId: typeof p.activeTabId === "string" ? p.activeTabId : tabs[0].id };
      },
    }
  )
);
