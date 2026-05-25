import { describe, it, expect, beforeEach } from "vitest";
import { useSqlEditorStore } from "../sql-editor-store";

describe("query-tabs (via sql-editor-store)", () => {
  beforeEach(() => {
    useSqlEditorStore.setState({
      tabs: [{ id: "tab-default", name: "Query 1", sql: "", createdAt: new Date().toISOString() }],
      activeTabId: "tab-default",
      currentSql: "",
    });
  });

  it("should have one default tab on init", () => {
    const state = useSqlEditorStore.getState();
    expect(state.tabs).toHaveLength(1);
    expect(state.tabs[0].name).toBe("Query 1");
    expect(state.activeTabId).toBe("tab-default");
  });

  it("should add a new tab", () => {
    const { addTab } = useSqlEditorStore.getState();
    const id = addTab("My Query", "SELECT 1");
    const state = useSqlEditorStore.getState();
    expect(state.tabs).toHaveLength(2);
    expect(state.activeTabId).toBe(id);
    expect(state.tabs[1].sql).toBe("SELECT 1");
  });

  it("should remove a tab but keep at least one", () => {
    const { addTab, removeTab } = useSqlEditorStore.getState();
    const id = addTab("Temp");
    expect(useSqlEditorStore.getState().tabs).toHaveLength(2);
    removeTab(id);
    expect(useSqlEditorStore.getState().tabs).toHaveLength(1);

    // Cannot remove the last tab
    removeTab("tab-default");
    expect(useSqlEditorStore.getState().tabs).toHaveLength(1);
  });

  it("should rename a tab", () => {
    const { renameTab } = useSqlEditorStore.getState();
    renameTab("tab-default", "Renamed");
    expect(useSqlEditorStore.getState().tabs[0].name).toBe("Renamed");
  });

  it("should switch active tab", () => {
    const { addTab, setActiveTab } = useSqlEditorStore.getState();
    const id = addTab("Second");
    setActiveTab("tab-default");
    expect(useSqlEditorStore.getState().activeTabId).toBe("tab-default");
    setActiveTab(id);
    expect(useSqlEditorStore.getState().activeTabId).toBe(id);
  });

  it("should update tab SQL", () => {
    const { updateTabSql } = useSqlEditorStore.getState();
    updateTabSql("tab-default", "SELECT * FROM users");
    expect(useSqlEditorStore.getState().tabs[0].sql).toBe("SELECT * FROM users");
  });

  it("should get active tab", () => {
    const { getActiveTab } = useSqlEditorStore.getState();
    const tab = getActiveTab();
    expect(tab).toBeDefined();
    expect(tab?.name).toBe("Query 1");
  });
});
