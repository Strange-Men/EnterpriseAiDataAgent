/**
 * @deprecated — Use sql-editor-store instead.
 *
 * Compatibility wrapper: auto-syncs from sql-editor-store.
 * All existing consumers continue to work unchanged.
 */

import { create } from "zustand";
import { useSqlEditorStore, type QueryTab } from "./sql-editor-store";

export type { QueryTab };

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

function snapshot(): QueryTabsState {
  const s = useSqlEditorStore.getState();
  return {
    tabs: s.tabs,
    activeTabId: s.activeTabId,
    addTab: (name, sql) => s.addTab(name, sql),
    removeTab: (id) => s.removeTab(id),
    renameTab: (id, name) => s.renameTab(id, name),
    setActiveTab: (id) => s.setActiveTab(id),
    updateTabSql: (id, sql) => s.updateTabSql(id, sql),
    getActiveTab: () => s.getActiveTab(),
  };
}

export const useQueryTabsStore = create<QueryTabsState>(() => snapshot());

useSqlEditorStore.subscribe(() => {
  useQueryTabsStore.setState(snapshot(), true);
});
