import { describe, it, expect, beforeEach } from "vitest";
import { useSqlEditorStore } from "../sql-editor-store";

describe("sql-workspace (via sql-editor-store)", () => {
  beforeEach(() => {
    useSqlEditorStore.setState({
      currentSql: "",
      isExecuting: false,
      queryResult: null,
      selectedTable: null,
      activePanelTab: "editor",
    });
  });

  it("should have correct initial state", () => {
    const state = useSqlEditorStore.getState();
    expect(state.currentSql).toBe("");
    expect(state.isExecuting).toBe(false);
    expect(state.queryResult).toBeNull();
    expect(state.selectedTable).toBeNull();
    expect(state.activePanelTab).toBe("editor");
  });

  it("should set current SQL", () => {
    const { setCurrentSql } = useSqlEditorStore.getState();
    setCurrentSql("SELECT * FROM users");
    expect(useSqlEditorStore.getState().currentSql).toBe("SELECT * FROM users");
  });

  it("should set executing state", () => {
    const { setExecuting } = useSqlEditorStore.getState();
    setExecuting(true);
    expect(useSqlEditorStore.getState().isExecuting).toBe(true);
    setExecuting(false);
    expect(useSqlEditorStore.getState().isExecuting).toBe(false);
  });

  it("should set query result", () => {
    const { setQueryResult } = useSqlEditorStore.getState();
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
    expect(useSqlEditorStore.getState().queryResult).toEqual(result);
  });

  it("should set query result to null", () => {
    const { setQueryResult } = useSqlEditorStore.getState();
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
    expect(useSqlEditorStore.getState().queryResult).toBeNull();
  });

  it("should handle query result with hasMore and truncated", () => {
    const { setQueryResult } = useSqlEditorStore.getState();
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
    const stored = useSqlEditorStore.getState().queryResult;
    expect(stored?.hasMore).toBe(true);
    expect(stored?.truncated).toBe(true);
    expect(stored?.totalRows).toBe(50000);
  });

  it("should handle error query result", () => {
    const { setQueryResult } = useSqlEditorStore.getState();
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
    expect(useSqlEditorStore.getState().queryResult?.status).toBe("error");
    expect(useSqlEditorStore.getState().queryResult?.error).toBe("Table not found");
  });

  it("should set selected table", () => {
    const { setSelectedTable } = useSqlEditorStore.getState();
    setSelectedTable("users");
    expect(useSqlEditorStore.getState().selectedTable).toBe("users");
    setSelectedTable(null);
    expect(useSqlEditorStore.getState().selectedTable).toBeNull();
  });

  it("should set active panel tab", () => {
    const { setActivePanelTab } = useSqlEditorStore.getState();
    setActivePanelTab("history");
    expect(useSqlEditorStore.getState().activePanelTab).toBe("history");
    setActivePanelTab("editor");
    expect(useSqlEditorStore.getState().activePanelTab).toBe("editor");
  });
});
