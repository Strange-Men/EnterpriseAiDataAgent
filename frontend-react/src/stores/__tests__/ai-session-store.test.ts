import { describe, it, expect, beforeEach } from "vitest";
import { useAiSessionStore } from "../ai-session-store";

describe("ai-session-store", () => {
  beforeEach(() => {
    useAiSessionStore.setState({
      turns: [],
      activeTable: null,
      lastColumns: null,
      lastRowCount: null,
      lastSql: null,
      lastInsightSummary: null,
    });
  });

  it("should have empty initial state", () => {
    const state = useAiSessionStore.getState();
    expect(state.turns).toEqual([]);
    expect(state.activeTable).toBeNull();
    expect(state.lastColumns).toBeNull();
    expect(state.lastRowCount).toBeNull();
    expect(state.lastSql).toBeNull();
    expect(state.lastInsightSummary).toBeNull();
  });

  it("should add user turn", () => {
    const { addUserTurn } = useAiSessionStore.getState();
    addUserTurn("Why did profit drop?");
    const turns = useAiSessionStore.getState().turns;
    expect(turns).toHaveLength(1);
    expect(turns[0].role).toBe("user");
    expect(turns[0].content).toBe("Why did profit drop?");
    expect(turns[0].timestamp).toBeTruthy();
  });

  it("should add assistant turn with sql", () => {
    const { addAssistantTurn } = useAiSessionStore.getState();
    addAssistantTurn("Profit dropped due to refunds.", "SELECT * FROM refunds");
    const turns = useAiSessionStore.getState().turns;
    expect(turns).toHaveLength(1);
    expect(turns[0].role).toBe("assistant");
    expect(turns[0].sql).toBe("SELECT * FROM refunds");
  });

  it("should capture lastSql and lastInsightSummary on assistant turn", () => {
    const { addAssistantTurn } = useAiSessionStore.getState();
    addAssistantTurn("Profit dropped 20%.", "SELECT SUM(amount) FROM sales");
    const state = useAiSessionStore.getState();
    expect(state.lastSql).toBe("SELECT SUM(amount) FROM sales");
    expect(state.lastInsightSummary).toBe("Profit dropped 20%.");
  });

  it("should update lastInsightSummary on each assistant turn", () => {
    const { addAssistantTurn } = useAiSessionStore.getState();
    addAssistantTurn("First insight.", "SELECT 1");
    addAssistantTurn("Second insight.", "SELECT 2");
    const state = useAiSessionStore.getState();
    expect(state.lastSql).toBe("SELECT 2");
    expect(state.lastInsightSummary).toBe("Second insight.");
  });

  it("should build conversation history", () => {
    const { addUserTurn, addAssistantTurn } = useAiSessionStore.getState();
    addUserTurn("Question 1");
    addAssistantTurn("Answer 1");
    addUserTurn("Follow-up");
    expect(useAiSessionStore.getState().turns).toHaveLength(3);
  });

  it("should cap turns at MAX_TURNS", () => {
    const { addUserTurn } = useAiSessionStore.getState();
    for (let i = 0; i < 25; i++) {
      addUserTurn(`Question ${i}`);
    }
    expect(useAiSessionStore.getState().turns).toHaveLength(20);
    expect(useAiSessionStore.getState().turns[0].content).toBe("Question 5");
  });

  it("should set context metadata", () => {
    const { setContext } = useAiSessionStore.getState();
    setContext({ table: "sales", columns: ["id", "amount"], rowCount: 500 });
    const state = useAiSessionStore.getState();
    expect(state.activeTable).toBe("sales");
    expect(state.lastColumns).toEqual(["id", "amount"]);
    expect(state.lastRowCount).toBe(500);
  });

  it("should preserve existing context on partial setContext", () => {
    const { setContext } = useAiSessionStore.getState();
    setContext({ table: "sales", columns: ["id"], rowCount: 100 });
    setContext({ rowCount: 200 });
    const state = useAiSessionStore.getState();
    expect(state.activeTable).toBe("sales");
    expect(state.lastColumns).toEqual(["id"]);
    expect(state.lastRowCount).toBe(200);
  });

  it("should get recent turns", () => {
    const { addUserTurn, getRecentTurns } = useAiSessionStore.getState();
    for (let i = 0; i < 15; i++) {
      addUserTurn(`Q${i}`);
    }
    expect(getRecentTurns(5)).toHaveLength(5);
    expect(getRecentTurns(5)[0].content).toBe("Q10");
    expect(getRecentTurns()).toHaveLength(10);
  });

  it("should clear all state", () => {
    const { addUserTurn, addAssistantTurn, setContext, clear } = useAiSessionStore.getState();
    addUserTurn("test");
    addAssistantTurn("answer", "SELECT 1");
    setContext({ table: "t" });
    clear();
    const state = useAiSessionStore.getState();
    expect(state.turns).toEqual([]);
    expect(state.activeTable).toBeNull();
    expect(state.lastSql).toBeNull();
    expect(state.lastInsightSummary).toBeNull();
  });
});
