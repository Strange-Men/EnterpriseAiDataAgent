/**
 * Regression tests for M4-7.1.3 — SQL Editor Store.
 *
 * Covers:
 *  - addTab defense against event objects (Query + button stability)
 *  - updateTabSql correctly writes SQL to the active tab
 *  - Tab name is always a safe string
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useSqlEditorStore } from "../sql-editor-store";

describe("sql-editor-store: M4-7.1.3 regression", () => {
  beforeEach(() => {
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

  describe("addTab (+ button stability)", () => {
    it("creates tab with safe name when called with no arguments", () => {
      const { addTab } = useSqlEditorStore.getState();
      const newTabId = addTab();

      const state = useSqlEditorStore.getState();
      const newTab = state.tabs.find((t) => t.id === newTabId);
      expect(typeof newTab?.name).toBe("string");
      expect(newTab?.name).toMatch(/^Query \d+$/);
    });

    it("creates tab with safe name when called with event-like object", () => {
      const { addTab } = useSqlEditorStore.getState();
      // Simulate onClick={addTab} passing event as first arg
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

      expect(typeof newTab?.name).toBe("string");
      expect(newTab?.name).toMatch(/^Query \d+$/);
      expect(newTab?.name).not.toContain("_reactName");
    });

    it("creates tab with safe sql when called with event-like object as sql", () => {
      const { addTab } = useSqlEditorStore.getState();
      const fakeEvent = { type: "click" } as unknown as string;

      const newTabId = addTab("Test", fakeEvent);
      const state = useSqlEditorStore.getState();
      const newTab = state.tabs.find((t) => t.id === newTabId);

      expect(typeof newTab?.sql).toBe("string");
      expect(newTab?.sql).toBe("");
    });
  });

  describe("updateTabSql (AI SQL generation target)", () => {
    it("writes SQL to the active tab", () => {
      const { updateTabSql } = useSqlEditorStore.getState();
      const activeTabId = useSqlEditorStore.getState().activeTabId;

      updateTabSql(activeTabId, "SELECT * FROM orders WHERE price > 500");

      const state = useSqlEditorStore.getState();
      expect(state.currentSql).toBe("SELECT * FROM orders WHERE price > 500");
      const activeTab = state.tabs.find((t) => t.id === activeTabId);
      expect(activeTab?.sql).toBe("SELECT * FROM orders WHERE price > 500");
    });

    it("updates currentSql only when updating the active tab", () => {
      const { addTab, updateTabSql, setActiveTab } = useSqlEditorStore.getState();
      const tab1Id = useSqlEditorStore.getState().activeTabId;
      const tab2Id = addTab("Query 2", "");

      // addTab auto-switches to tab2, so switch back to tab1
      setActiveTab(tab1Id);

      // Update tab1 SQL (active)
      updateTabSql(tab1Id, "SELECT 1");
      expect(useSqlEditorStore.getState().currentSql).toBe("SELECT 1");

      // Switch to tab2
      setActiveTab(tab2Id);
      expect(useSqlEditorStore.getState().currentSql).toBe("");

      // Update tab1 SQL (now inactive) — currentSql should NOT change
      updateTabSql(tab1Id, "SELECT 2");
      expect(useSqlEditorStore.getState().currentSql).toBe("");
    });
  });

  describe("Query 2 stability (+ then use)", () => {
    it("Query 2 tab has correct default name and empty SQL", () => {
      const { addTab } = useSqlEditorStore.getState();
      const tab2Id = addTab();

      const state = useSqlEditorStore.getState();
      const tab2 = state.tabs.find((t) => t.id === tab2Id);

      expect(tab2?.name).toBe("Query 2");
      expect(tab2?.sql).toBe("");
      expect(state.activeTabId).toBe(tab2Id);
      expect(state.currentSql).toBe("");
    });

    it("Query 2 can receive AI-generated SQL", () => {
      const { addTab, updateTabSql } = useSqlEditorStore.getState();
      const tab2Id = addTab();

      updateTabSql(tab2Id, "SELECT * FROM products ORDER BY revenue DESC LIMIT 10");

      const state = useSqlEditorStore.getState();
      expect(state.currentSql).toBe("SELECT * FROM products ORDER BY revenue DESC LIMIT 10");
    });
  });
});
