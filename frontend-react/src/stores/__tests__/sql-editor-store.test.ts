import { describe, it, expect, beforeEach } from "vitest";
import { useSqlEditorStore } from "../sql-editor-store";

describe("sql-editor-store", () => {
  beforeEach(() => {
    // Reset store state before each test
    useSqlEditorStore.setState({
      tabs: [{ id: "tab-default", name: "Query 1", sql: "", createdAt: "2026-01-01T00:00:00.000Z" }],
      activeTabId: "tab-default",
      currentSql: "",
      isExecuting: false,
      queryResult: null,
      offset: 0,
      limit: 1000,
      totalRows: 0,
      hasMore: false,
      isLoadingMore: false,
      activePanelTab: "editor",
    });
  });

  describe("addTab", () => {
    it("should create a new tab and set it as active", () => {
      const { addTab } = useSqlEditorStore.getState();
      const newTabId = addTab();

      const state = useSqlEditorStore.getState();
      expect(state.tabs).toHaveLength(2);
      expect(state.activeTabId).toBe(newTabId);
      expect(state.tabs.find((t) => t.id === newTabId)).toBeDefined();
    });

    it("should create tab with custom name and sql", () => {
      const { addTab } = useSqlEditorStore.getState();
      const newTabId = addTab("Custom Query", "SELECT * FROM users");

      const state = useSqlEditorStore.getState();
      const newTab = state.tabs.find((t) => t.id === newTabId);
      expect(newTab?.name).toBe("Custom Query");
      expect(newTab?.sql).toBe("SELECT * FROM users");
      expect(state.currentSql).toBe("SELECT * FROM users");
    });

    it("should clear queryResult when creating blank tab", () => {
      const { setQueryResult, addTab } = useSqlEditorStore.getState();

      // Set a mock query result
      setQueryResult({
        queryId: "test-1",
        sql: "SELECT 1",
        status: "success",
        data: [{ id: 1 }],
        columns: ["id"],
        rowCount: 1,
        runtimeMs: 100,
        error: null,
      });

      expect(useSqlEditorStore.getState().queryResult).not.toBeNull();

      // Add blank tab should clear result
      addTab();
      expect(useSqlEditorStore.getState().queryResult).toBeNull();
    });

    it("should NOT clear queryResult when creating tab with SQL", () => {
      const { setQueryResult, addTab } = useSqlEditorStore.getState();

      // Set a mock query result
      setQueryResult({
        queryId: "test-2",
        sql: "SELECT 1",
        status: "success",
        data: [{ id: 1 }],
        columns: ["id"],
        rowCount: 1,
        runtimeMs: 100,
        error: null,
      });

      // Add tab with SQL should preserve result
      addTab("Query", "SELECT 1");
      expect(useSqlEditorStore.getState().queryResult).not.toBeNull();
    });

    it("should have complete default structure for new tab", () => {
      const { addTab } = useSqlEditorStore.getState();
      const newTabId = addTab();

      const state = useSqlEditorStore.getState();
      const newTab = state.tabs.find((t) => t.id === newTabId);

      expect(newTab).toBeDefined();
      expect(newTab?.id).toBe(newTabId);
      expect(typeof newTab?.name).toBe("string");
      expect(typeof newTab?.sql).toBe("string");
      expect(typeof newTab?.createdAt).toBe("string");
    });

    it("should not store event-like objects as tab name (React #31 defense)", () => {
      const { addTab } = useSqlEditorStore.getState();
      // Simulate what happens when onClick={addTab} passes MouseEvent as first arg
      const fakeEvent = {
        _reactName: "onClick",
        type: "click",
        nativeEvent: new Event("click"),
        target: document.createElement("button"),
        currentTarget: document.createElement("button"),
      } as unknown as string;

      const newTabId = addTab(fakeEvent);
      const state = useSqlEditorStore.getState();
      const newTab = state.tabs.find((t) => t.id === newTabId);

      // Tab name should be the fallback, not the event object
      expect(typeof newTab?.name).toBe("string");
      expect(newTab?.name).toMatch(/^Query \d+$/);
      expect(newTab?.name).not.toContain("_reactName");
    });

    it("should handle undefined name gracefully", () => {
      const { addTab } = useSqlEditorStore.getState();
      const newTabId = addTab(undefined, "SELECT 1");
      const state = useSqlEditorStore.getState();
      const newTab = state.tabs.find((t) => t.id === newTabId);

      expect(typeof newTab?.name).toBe("string");
      expect(newTab?.name).toMatch(/^Query \d+$/);
      expect(newTab?.sql).toBe("SELECT 1");
    });

    it("should handle non-string sql gracefully", () => {
      const { addTab } = useSqlEditorStore.getState();
      const newTabId = addTab("Test", undefined);
      const state = useSqlEditorStore.getState();
      const newTab = state.tabs.find((t) => t.id === newTabId);

      expect(newTab?.sql).toBe("");
    });
  });

  describe("setActiveTab", () => {
    it("should switch active tab and sync currentSql", () => {
      const { addTab, setActiveTab, updateTabSql } = useSqlEditorStore.getState();

      // Create two tabs with different SQL
      const tab1Id = useSqlEditorStore.getState().activeTabId;
      updateTabSql(tab1Id, "SELECT 1");
      const tab2Id = addTab("Query 2", "SELECT 2");

      // Switch to tab2
      setActiveTab(tab2Id);
      expect(useSqlEditorStore.getState().currentSql).toBe("SELECT 2");

      // Switch back to tab1
      setActiveTab(tab1Id);
      expect(useSqlEditorStore.getState().currentSql).toBe("SELECT 1");
    });
  });

  describe("removeTab", () => {
    it("should not remove the last tab", () => {
      const { removeTab } = useSqlEditorStore.getState();
      const tabId = useSqlEditorStore.getState().activeTabId;

      removeTab(tabId);
      expect(useSqlEditorStore.getState().tabs).toHaveLength(1);
    });

    it("should switch to adjacent tab when removing active tab", () => {
      const { addTab, removeTab } = useSqlEditorStore.getState();
      const _tab1Id = useSqlEditorStore.getState().activeTabId;
      const tab2Id = addTab("Query 2", "SELECT 2");
      const tab3Id = addTab("Query 3", "SELECT 3");

      // Remove tab2 (active)
      removeTab(tab2Id);
      const state = useSqlEditorStore.getState();
      expect(state.tabs).toHaveLength(2);
      expect(state.activeTabId).toBe(tab3Id);
    });
  });
});
