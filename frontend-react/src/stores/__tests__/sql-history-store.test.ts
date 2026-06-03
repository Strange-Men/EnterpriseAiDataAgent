import { describe, it, expect, beforeEach } from "vitest";
import { useSqlHistoryStore } from "../sql-history-store";

describe("sql-history-store", () => {
  const makeEntry = (id: number, sql: string, status: "success" | "error" = "success") => ({
    id: String(id),
    sql,
    status,
    runtimeMs: 10,
    rowCount: 1,
    error: null,
    timestamp: new Date().toISOString(),
  });

  beforeEach(() => {
    useSqlHistoryStore.setState({
      history: [],
      searchQuery: "",
      filterStatus: "all",
    });
  });

  it("should add an entry", () => {
    const { addEntry } = useSqlHistoryStore.getState();
    addEntry(makeEntry(1, "SELECT 1"));
    expect(useSqlHistoryStore.getState().history).toHaveLength(1);
  });

  it("should add entries at the front (newest first)", () => {
    const { addEntry } = useSqlHistoryStore.getState();
    addEntry(makeEntry(1, "SELECT 1"));
    addEntry(makeEntry(2, "SELECT 2"));
    expect(useSqlHistoryStore.getState().history[0].sql).toBe("SELECT 2");
  });

  it("should limit to 200 entries", () => {
    const { addEntry } = useSqlHistoryStore.getState();
    for (let i = 0; i < 210; i++) {
      addEntry(makeEntry(i, `SELECT ${i}`));
    }
    expect(useSqlHistoryStore.getState().history).toHaveLength(200);
    // Newest should be first
    expect(useSqlHistoryStore.getState().history[0].sql).toBe("SELECT 209");
  });

  it("should remove an entry", () => {
    const { addEntry, removeEntry } = useSqlHistoryStore.getState();
    addEntry(makeEntry(1, "SELECT 1"));
    addEntry(makeEntry(2, "SELECT 2"));
    removeEntry("2");
    expect(useSqlHistoryStore.getState().history).toHaveLength(1);
    expect(useSqlHistoryStore.getState().history[0].id).toBe("1");
  });

  it("should clear history", () => {
    const { addEntry, clearHistory } = useSqlHistoryStore.getState();
    addEntry(makeEntry(1, "SELECT 1"));
    clearHistory();
    expect(useSqlHistoryStore.getState().history).toHaveLength(0);
  });

  it("should filter by search query", () => {
    const { addEntry, setSearchQuery, getFiltered } = useSqlHistoryStore.getState();
    addEntry(makeEntry(1, "SELECT * FROM users"));
    addEntry(makeEntry(2, "SELECT * FROM orders"));
    setSearchQuery("users");
    expect(getFiltered()).toHaveLength(1);
    expect(getFiltered()[0].sql).toContain("users");
  });

  it("should filter by status", () => {
    const { addEntry, setFilterStatus, getFiltered } = useSqlHistoryStore.getState();
    addEntry(makeEntry(1, "SELECT 1", "success"));
    addEntry(makeEntry(2, "SELECT 2", "error"));
    setFilterStatus("error");
    expect(getFiltered()).toHaveLength(1);
    expect(getFiltered()[0].status).toBe("error");
  });

  it("should export history as JSON", () => {
    const { addEntry, exportHistory } = useSqlHistoryStore.getState();
    addEntry(makeEntry(1, "SELECT 1"));
    const json = exportHistory();
    const parsed = JSON.parse(json);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].sql).toBe("SELECT 1");
  });
});
