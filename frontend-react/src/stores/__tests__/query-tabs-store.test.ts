import { describe, it, expect, beforeEach } from "vitest";
import { useQueryTabsStore } from "../query-tabs-store";

describe("query-tabs-store", () => {
  beforeEach(() => {
    // Reset store to initial state
    useQueryTabsStore.setState({
      tabs: [{ id: "tab-default", name: "Query 1", sql: "", createdAt: new Date().toISOString() }],
      activeTabId: "tab-default",
    });
  });

  it("should have one default tab on init", () => {
    const state = useQueryTabsStore.getState();
    expect(state.tabs).toHaveLength(1);
    expect(state.tabs[0].name).toBe("Query 1");
    expect(state.activeTabId).toBe("tab-default");
  });

  it("should add a new tab", () => {
    const { addTab } = useQueryTabsStore.getState();
    const id = addTab("My Query", "SELECT 1");
    const state = useQueryTabsStore.getState();
    expect(state.tabs).toHaveLength(2);
    expect(state.activeTabId).toBe(id);
    expect(state.tabs[1].sql).toBe("SELECT 1");
  });

  it("should remove a tab but keep at least one", () => {
    const { addTab, removeTab } = useQueryTabsStore.getState();
    const id = addTab("Temp");
    expect(useQueryTabsStore.getState().tabs).toHaveLength(2);
    removeTab(id);
    expect(useQueryTabsStore.getState().tabs).toHaveLength(1);

    // Cannot remove the last tab
    removeTab("tab-default");
    expect(useQueryTabsStore.getState().tabs).toHaveLength(1);
  });

  it("should rename a tab", () => {
    const { renameTab } = useQueryTabsStore.getState();
    renameTab("tab-default", "Renamed");
    expect(useQueryTabsStore.getState().tabs[0].name).toBe("Renamed");
  });

  it("should switch active tab", () => {
    const { addTab, setActiveTab } = useQueryTabsStore.getState();
    const id = addTab("Second");
    setActiveTab("tab-default");
    expect(useQueryTabsStore.getState().activeTabId).toBe("tab-default");
    setActiveTab(id);
    expect(useQueryTabsStore.getState().activeTabId).toBe(id);
  });

  it("should update tab SQL", () => {
    const { updateTabSql } = useQueryTabsStore.getState();
    updateTabSql("tab-default", "SELECT * FROM users");
    expect(useQueryTabsStore.getState().tabs[0].sql).toBe("SELECT * FROM users");
  });

  it("should get active tab", () => {
    const { getActiveTab } = useQueryTabsStore.getState();
    const tab = getActiveTab();
    expect(tab).toBeDefined();
    expect(tab?.name).toBe("Query 1");
  });
});
