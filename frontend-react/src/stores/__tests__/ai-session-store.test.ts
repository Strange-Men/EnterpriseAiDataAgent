import { describe, it, expect, beforeEach } from "vitest";
import { useInvestigationStore } from "../investigation-store";

describe("ai-session (via investigation-store)", () => {
  beforeEach(() => {
    useInvestigationStore.getState().clear();
  });

  it("should have empty initial state", () => {
    const state = useInvestigationStore.getState();
    expect(state.turns).toEqual([]);
    expect(state.activeTable).toBeNull();
    expect(state.lastColumns).toBeNull();
    expect(state.lastRowCount).toBeNull();
    expect(state.lastSql).toBeNull();
    expect(state.lastInsightSummary).toBeNull();
    expect(state.compressedSummary).toBeNull();
    expect(state.keyFindings).toEqual([]);
    expect(state.investigationSummary).toBeNull();
  });

  it("should add user turn", () => {
    const { addUserTurn } = useInvestigationStore.getState();
    addUserTurn("Why did profit drop?");
    const turns = useInvestigationStore.getState().turns;
    expect(turns).toHaveLength(1);
    expect(turns[0].role).toBe("user");
    expect(turns[0].content).toBe("Why did profit drop?");
    expect(turns[0].timestamp).toBeTruthy();
  });

  it("should add assistant turn with sql", () => {
    const { addAssistantTurn } = useInvestigationStore.getState();
    addAssistantTurn("Profit dropped due to refunds.", "SELECT * FROM refunds");
    const turns = useInvestigationStore.getState().turns;
    expect(turns).toHaveLength(1);
    expect(turns[0].role).toBe("assistant");
    expect(turns[0].sql).toBe("SELECT * FROM refunds");
  });

  it("should capture lastSql and lastInsightSummary on assistant turn", () => {
    const { addAssistantTurn } = useInvestigationStore.getState();
    addAssistantTurn("Profit dropped 20%.", "SELECT SUM(amount) FROM sales");
    const state = useInvestigationStore.getState();
    expect(state.lastSql).toBe("SELECT SUM(amount) FROM sales");
    expect(state.lastInsightSummary).toBe("Profit dropped 20%.");
  });

  it("should update lastInsightSummary on each assistant turn", () => {
    const { addAssistantTurn } = useInvestigationStore.getState();
    addAssistantTurn("First insight.", "SELECT 1");
    addAssistantTurn("Second insight.", "SELECT 2");
    const state = useInvestigationStore.getState();
    expect(state.lastSql).toBe("SELECT 2");
    expect(state.lastInsightSummary).toBe("Second insight.");
  });

  it("should build conversation history", () => {
    const { addUserTurn, addAssistantTurn } = useInvestigationStore.getState();
    addUserTurn("Question 1");
    addAssistantTurn("Answer 1");
    addUserTurn("Follow-up");
    expect(useInvestigationStore.getState().turns).toHaveLength(3);
  });

  it("should compress turns when exceeding COMPRESS_AT", () => {
    const { addUserTurn } = useInvestigationStore.getState();
    for (let i = 0; i < 25; i++) {
      addUserTurn(`Question ${i}`);
    }
    // Compression kicks in at 16 turns, keeping 8 + new additions
    // After 25 turns: compressed at 16→8, then grew to 9 (25-16=9 kept)
    expect(useInvestigationStore.getState().turns.length).toBeLessThanOrEqual(10);
    // Older turns are compressed into summary
    expect(useInvestigationStore.getState().compressedSummary).toBeTruthy();
  });

  it("should set context metadata", () => {
    const { setContext } = useInvestigationStore.getState();
    setContext({ table: "sales", columns: ["id", "amount"], rowCount: 500 });
    const state = useInvestigationStore.getState();
    expect(state.activeTable).toBe("sales");
    expect(state.lastColumns).toEqual(["id", "amount"]);
    expect(state.lastRowCount).toBe(500);
  });

  it("should preserve existing context on partial setContext", () => {
    const { setContext } = useInvestigationStore.getState();
    setContext({ table: "sales", columns: ["id"], rowCount: 100 });
    setContext({ rowCount: 200 });
    const state = useInvestigationStore.getState();
    expect(state.activeTable).toBe("sales");
    expect(state.lastColumns).toEqual(["id"]);
    expect(state.lastRowCount).toBe(200);
  });

  it("should get recent turns", () => {
    const { addUserTurn, getRecentTurns } = useInvestigationStore.getState();
    for (let i = 0; i < 15; i++) {
      addUserTurn(`Q${i}`);
    }
    expect(getRecentTurns(5)).toHaveLength(5);
    expect(getRecentTurns(5)[0].content).toBe("Q10");
    expect(getRecentTurns()).toHaveLength(10);
  });

  it("should clear all state", () => {
    const { addUserTurn, addAssistantTurn, setContext, clear } = useInvestigationStore.getState();
    addUserTurn("test");
    addAssistantTurn("answer", "SELECT 1");
    setContext({ table: "t" });
    clear();
    const state = useInvestigationStore.getState();
    expect(state.turns).toEqual([]);
    expect(state.activeTable).toBeNull();
    expect(state.lastSql).toBeNull();
    expect(state.lastInsightSummary).toBeNull();
    expect(state.compressedSummary).toBeNull();
    expect(state.keyFindings).toEqual([]);
    expect(state.investigationSummary).toBeNull();
  });

  // ── v0.7.1: Key Findings ─────────────────────────────────────

  describe("addKeyFinding", () => {
    it("should add a key finding", () => {
      const { addKeyFinding } = useInvestigationStore.getState();
      addKeyFinding("Revenue grew 20%");
      expect(useInvestigationStore.getState().keyFindings).toEqual(["Revenue grew 20%"]);
    });

    it("should deduplicate findings (case-insensitive)", () => {
      const { addKeyFinding } = useInvestigationStore.getState();
      addKeyFinding("Revenue grew 20%");
      addKeyFinding("revenue grew 20%");
      expect(useInvestigationStore.getState().keyFindings).toHaveLength(1);
    });

    it("should cap at 10 findings", () => {
      const { addKeyFinding } = useInvestigationStore.getState();
      for (let i = 0; i < 15; i++) {
        addKeyFinding(`Finding ${i}`);
      }
      const findings = useInvestigationStore.getState().keyFindings;
      expect(findings).toHaveLength(10);
      expect(findings[0]).toBe("Finding 5"); // oldest dropped
      expect(findings[9]).toBe("Finding 14");
    });
  });

  describe("setInvestigationSummary", () => {
    it("should set investigation summary", () => {
      const { setInvestigationSummary } = useInvestigationStore.getState();
      setInvestigationSummary("Investigating Q3 trends");
      expect(useInvestigationStore.getState().investigationSummary).toBe("Investigating Q3 trends");
    });
  });

  describe("getContextForInsights", () => {
    it("should return null when no findings or summary", () => {
      const { getContextForInsights } = useInvestigationStore.getState();
      expect(getContextForInsights()).toBeNull();
    });

    it("should build context from key findings", () => {
      const { addKeyFinding, getContextForInsights } = useInvestigationStore.getState();
      addKeyFinding("Revenue grew 20%");
      addKeyFinding("Churn rate is 5%");
      const context = getContextForInsights();
      expect(context).toContain("Key Findings from prior analysis:");
      expect(context).toContain("1. Revenue grew 20%");
      expect(context).toContain("2. Churn rate is 5%");
    });

    it("should include investigation summary", () => {
      const { addKeyFinding, setInvestigationSummary, getContextForInsights } = useInvestigationStore.getState();
      addKeyFinding("Finding A");
      setInvestigationSummary("Thread summary here");
      const context = getContextForInsights();
      expect(context).toContain("Investigation Summary:");
      expect(context).toContain("Thread summary here");
    });

    it("should cap findings at 5 in context", () => {
      const { addKeyFinding, getContextForInsights } = useInvestigationStore.getState();
      for (let i = 0; i < 8; i++) {
        addKeyFinding(`Finding ${i}`);
      }
      const context = getContextForInsights();
      // Cap at 5 means first 5 findings (0-4)
      expect(context).toContain("5. Finding 4");
      expect(context).not.toContain("6. Finding 5");
    });
  });

  describe("getContextForPlan", () => {
    it("should return null when no findings", () => {
      const { getContextForPlan } = useInvestigationStore.getState();
      expect(getContextForPlan()).toBeNull();
    });

    it("should return top 5 findings", () => {
      const { addKeyFinding, getContextForPlan } = useInvestigationStore.getState();
      for (let i = 0; i < 8; i++) {
        addKeyFinding(`Finding ${i}`);
      }
      const findings = getContextForPlan();
      expect(findings).toHaveLength(5);
      expect(findings![0]).toBe("Finding 0");
      expect(findings![4]).toBe("Finding 4");
    });
  });

  describe("getContextForApi", () => {
    it("should include keyFindings and investigationSummary", () => {
      const { addKeyFinding, setInvestigationSummary, getContextForApi } = useInvestigationStore.getState();
      addKeyFinding("Finding A");
      setInvestigationSummary("Summary");
      const apiCtx = getContextForApi();
      expect(apiCtx.keyFindings).toEqual(["Finding A"]);
      expect(apiCtx.investigationSummary).toBe("Summary");
    });
  });

  // ── v0.7.1: Structured Compression ───────────────────────────

  describe("structured compression", () => {
    it("should produce structured summary with full SQL", () => {
      const { addUserTurn, addAssistantTurn } = useInvestigationStore.getState();
      // Add 8 pairs to get past COMPRESS_AT (16 turns total)
      for (let i = 0; i < 8; i++) {
        addUserTurn(`Question ${i}`);
        addAssistantTurn(`Answer ${i}. This is detailed.`, `SELECT ${i}`);
      }
      const state = useInvestigationStore.getState();
      expect(state.compressedSummary).toBeTruthy();
      // Full SQL should be preserved (not truncated)
      expect(state.compressedSummary).toContain("SQL: SELECT");
      // Finding entries should be present
      expect(state.compressedSummary).toContain("Finding:");
    });

    it("should extract first sentence as Finding in compressed summary", () => {
      const { addUserTurn, addAssistantTurn } = useInvestigationStore.getState();
      for (let i = 0; i < 8; i++) {
        addUserTurn(`Question ${i}`);
        addAssistantTurn(`Revenue grew 20% in Q${i}. More details here.`);
      }
      const state = useInvestigationStore.getState();
      // At least one Finding entry should be in compressed summary
      expect(state.compressedSummary).toContain("Finding:");
      expect(state.compressedSummary).toMatch(/Finding: Revenue grew 20% in Q\d/);
    });

    it("should truncate long user questions to 120 chars in compression", () => {
      const longQ = "A".repeat(200);
      const { addUserTurn, addAssistantTurn } = useInvestigationStore.getState();
      for (let i = 0; i < 8; i++) {
        addUserTurn(longQ);
        addAssistantTurn("Answer");
      }
      const state = useInvestigationStore.getState();
      // Compressed summary should contain truncated version
      expect(state.compressedSummary).toContain("A".repeat(120) + "...");
    });

    it("should produce Q-prefix for user turns and Finding/SQL for assistant turns", () => {
      const { addUserTurn, addAssistantTurn } = useInvestigationStore.getState();
      for (let i = 0; i < 8; i++) {
        addUserTurn(`Test question ${i}`);
        addAssistantTurn(`Test answer ${i}.`, `SELECT ${i}`);
      }
      const state = useInvestigationStore.getState();
      // Verify structured format
      expect(state.compressedSummary).toMatch(/Q: Test question \d/);
      expect(state.compressedSummary).toMatch(/SQL: SELECT \d/);
      expect(state.compressedSummary).toMatch(/Finding: Test answer \d/);
    });
  });
});
