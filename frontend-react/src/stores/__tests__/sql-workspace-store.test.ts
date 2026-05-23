import { describe, it, expect, beforeEach } from "vitest";
import { useSqlWorkspaceStore } from "../sql-workspace-store";

describe("sql-workspace-store", () => {
  beforeEach(() => {
    useSqlWorkspaceStore.setState({
      currentSql: "",
      isExecuting: false,
      queryResult: null,
      selectedTable: null,
      activeTab: "editor",
    });
  });

  it("should have correct initial state", () => {
    const state = useSqlWorkspaceStore.getState();
    expect(state.currentSql).toBe("");
    expect(state.isExecuting).toBe(false);
    expect(state.queryResult).toBeNull();
    expect(state.selectedTable).toBeNull();
    expect(state.activeTab).toBe("editor");
  });

  it("should set current SQL", () => {
    const { setCurrentSql } = useSqlWorkspaceStore.getState();
    setCurrentSql("SELECT * FROM users");
    expect(useSqlWorkspaceStore.getState().currentSql).toBe("SELECT * FROM users");
  });

  it("should set executing state", () => {
    const { setExecuting } = useSqlWorkspaceStore.getState();
    setExecuting(true);
    expect(useSqlWorkspaceStore.getState().isExecuting).toBe(true);
    setExecuting(false);
    expect(useSqlWorkspaceStore.getState().isExecuting).toBe(false);
  });

  it("should set query result", () => {
    const { setQueryResult } = useSqlWorkspaceStore.getState();
    const result = {
      queryId: 1,
      sql: "SELECT 1",
      columns: ["val"],
      data: [{ val: 1 }],
      rowCount: 1,
      runtimeMs: 5,
      status: "success" as const,
      error: null,
    };
    setQueryResult(result);
    expect(useSqlWorkspaceStore.getState().queryResult).toEqual(result);
  });

  it("should set query result to null", () => {
    const { setQueryResult } = useSqlWorkspaceStore.getState();
    setQueryResult({
      queryId: 1,
      sql: "SELECT 1",
      columns: [],
      data: [],
      rowCount: 0,
      runtimeMs: 0,
      status: "success" as const,
      error: null,
    });
    setQueryResult(null);
    expect(useSqlWorkspaceStore.getState().queryResult).toBeNull();
  });

  it("should handle query result with hasMore and truncated", () => {
    const { setQueryResult } = useSqlWorkspaceStore.getState();
    const result = {
      queryId: 2,
      sql: "SELECT * FROM big_table",
      columns: ["id", "name"],
      data: [{ id: 1, name: "test" }],
      rowCount: 10000,
      totalRows: 50000,
      hasMore: true,
      truncated: true,
      runtimeMs: 120,
      status: "success" as const,
      error: null,
    };
    setQueryResult(result);
    const stored = useSqlWorkspaceStore.getState().queryResult;
    expect(stored?.hasMore).toBe(true);
    expect(stored?.truncated).toBe(true);
    expect(stored?.totalRows).toBe(50000);
  });

  it("should handle error query result", () => {
    const { setQueryResult } = useSqlWorkspaceStore.getState();
    const result = {
      queryId: 3,
      sql: "SELECT * FROM nonexistent",
      columns: [],
      data: [],
      rowCount: 0,
      runtimeMs: 2,
      status: "error" as const,
      error: "Table not found",
    };
    setQueryResult(result);
    expect(useSqlWorkspaceStore.getState().queryResult?.status).toBe("error");
    expect(useSqlWorkspaceStore.getState().queryResult?.error).toBe("Table not found");
  });

  it("should set selected table", () => {
    const { setSelectedTable } = useSqlWorkspaceStore.getState();
    setSelectedTable("users");
    expect(useSqlWorkspaceStore.getState().selectedTable).toBe("users");
    setSelectedTable(null);
    expect(useSqlWorkspaceStore.getState().selectedTable).toBeNull();
  });

  it("should set active tab", () => {
    const { setActiveTab } = useSqlWorkspaceStore.getState();
    setActiveTab("history");
    expect(useSqlWorkspaceStore.getState().activeTab).toBe("history");
    setActiveTab("editor");
    expect(useSqlWorkspaceStore.getState().activeTab).toBe("editor");
  });
});
