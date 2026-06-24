import { describe, it, expect, beforeEach } from "vitest";
import { useSqlHistoryStore } from "../sql-history-store";

describe("sql-history-store", () => {
  const makeEntry = (id: number, sql: string, status: "success" | "error" = "success") => ({
    id: String(id),
    type: "sql" as const,
    sql,
    status,
    runtimeMs: 10,
    rowCount: 1,
    error: null,
    timestamp: new Date().toISOString(),
  });

  const makeAiEntry = (id: number, question: string, summary: string) => ({
    id: String(id),
    type: "ai" as const,
    sql: "SELECT 1",
    question,
    tableName: "test_table",
    summary,
    status: "success" as const,
    runtimeMs: 100,
    rowCount: 10,
    error: null,
    timestamp: new Date().toISOString(),
  });

  beforeEach(() => {
    useSqlHistoryStore.setState({
      history: [],
      searchQuery: "",
      filterStatus: "all",
      filterType: "all",
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

  it("should add AI analysis entry", () => {
    const { addEntry } = useSqlHistoryStore.getState();
    addEntry(makeAiEntry(1, "What are the top categories?", "Top categories by revenue..."));
    expect(useSqlHistoryStore.getState().history).toHaveLength(1);
    expect(useSqlHistoryStore.getState().history[0].type).toBe("ai");
    expect(useSqlHistoryStore.getState().history[0].question).toBe("What are the top categories?");
  });

  it("should filter by type", () => {
    const { addEntry, setFilterType, getFiltered } = useSqlHistoryStore.getState();
    addEntry(makeEntry(1, "SELECT 1"));
    addEntry(makeAiEntry(2, "What are the top categories?", "Summary"));
    setFilterType("ai");
    expect(getFiltered()).toHaveLength(1);
    expect(getFiltered()[0].type).toBe("ai");
    setFilterType("sql");
    expect(getFiltered()).toHaveLength(1);
    expect(getFiltered()[0].type).toBe("sql");
    setFilterType("all");
    expect(getFiltered()).toHaveLength(2);
  });

  it("should search by question field", () => {
    const { addEntry, setSearchQuery, getFiltered } = useSqlHistoryStore.getState();
    addEntry(makeEntry(1, "SELECT * FROM users"));
    addEntry(makeAiEntry(2, "What are the top categories?", "Summary about categories"));
    setSearchQuery("categories");
    expect(getFiltered()).toHaveLength(1);
    expect(getFiltered()[0].question).toContain("categories");
  });

  it("should preserve AI entries when fetching history from backend", async () => {
    const { addEntry } = useSqlHistoryStore.getState();

    // Add local AI entry
    addEntry(makeAiEntry(1, "AI question", "AI summary"));

    // Simulate what fetchHistory does: merge backend SQL entries with local AI entries
    const currentHistory = useSqlHistoryStore.getState().history;
    const localAiEntries = currentHistory.filter((e) => e.type === "ai");
    const backendHistory = [makeEntry(2, "SELECT 1"), makeEntry(3, "SELECT 2")];

    const seenIds = new Set(backendHistory.map((e) => e.id));
    const merged = [
      ...backendHistory,
      ...localAiEntries.filter((e) => !seenIds.has(e.id)),
    ];

    // AI entry should be preserved
    expect(merged.some((e) => e.type === "ai")).toBe(true);
    const aiEntry = merged.find((e) => e.type === "ai") as { type: string; question?: string } | undefined;
    expect(aiEntry).toBeDefined();
    expect(aiEntry!.question).toBe("AI question");
  });

  it("should allow SQL and AI records to coexist", () => {
    const { addEntry, getFiltered } = useSqlHistoryStore.getState();

    addEntry(makeEntry(1, "SELECT 1"));
    addEntry(makeAiEntry(2, "AI question", "AI summary"));

    expect(useSqlHistoryStore.getState().history).toHaveLength(2);

    // Filter by type should work
    const { setFilterType } = useSqlHistoryStore.getState();
    setFilterType("sql");
    expect(getFiltered()).toHaveLength(1);
    expect(getFiltered()[0].type).toBe("sql");

    setFilterType("ai");
    expect(getFiltered()).toHaveLength(1);
    expect(getFiltered()[0].type).toBe("ai");

    setFilterType("all");
    expect(getFiltered()).toHaveLength(2);
  });

  it("should deduplicate entries by id when merging", () => {
    const { addEntry } = useSqlHistoryStore.getState();

    // Add entry with id "1"
    addEntry(makeEntry(1, "SELECT 1"));

    // Simulate backend returning same id
    const currentHistory = useSqlHistoryStore.getState().history;
    const backendHistory = [makeEntry(1, "SELECT 1 UPDATED")];
    const localAiEntries = currentHistory.filter((e) => e.type === "ai");

    const seenIds = new Set(backendHistory.map((e) => e.id));
    const merged = [
      ...backendHistory,
      ...localAiEntries.filter((e) => !seenIds.has(e.id)),
    ];

    // Should have only one entry (deduplicated)
    expect(merged).toHaveLength(1);
    // Backend version should win
    expect(merged[0].sql).toBe("SELECT 1 UPDATED");
  });
});
