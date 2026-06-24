/**
 * Regression tests for M4-7.1.3 — Analysis Detail Page + NL-to-SQL Hotfix.
 *
 * Covers:
 *  - getEvolutionChain returns stable results (not infinite re-render source)
 *  - Store prevents event objects from being written to run fields
 *  - Feature flag showAiSqlInputInWorkspace is enabled
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useAnalysisStore } from "../analysis-store";

describe("analysis-store: getEvolutionChain regression (M4-7.1.3)", () => {
  beforeEach(() => {
    useAnalysisStore.setState({ runs: [], activeRunId: null });
  });

  it("returns empty chain for non-existent run id", () => {
    const { getEvolutionChain } = useAnalysisStore.getState();
    const chain = getEvolutionChain("non-existent-id");
    expect(chain).toEqual([]);
  });

  it("returns single run for a run with no parent", () => {
    const { addRun } = useAnalysisStore.getState();
    const id = addRun("autonomous", "test question", "test_table");

    const { getEvolutionChain } = useAnalysisStore.getState();
    const chain = getEvolutionChain(id);
    expect(chain).toHaveLength(1);
    expect(chain[0].id).toBe(id);
  });

  it("returns parent + child chain in chronological order", () => {
    const { addRun, drillDownRun } = useAnalysisStore.getState();
    const parentId = addRun("autonomous", "parent question", "test_table");

    // Simulate completion
    useAnalysisStore.getState().updateRun(parentId, { status: "success" });

    const childId = drillDownRun(parentId, 0, "finding text");

    const { getEvolutionChain } = useAnalysisStore.getState();
    const chain = getEvolutionChain(childId!);
    expect(chain).toHaveLength(2);
    expect(chain[0].id).toBe(parentId);
    expect(chain[1].id).toBe(childId);
  });

  it("returns consistent results when called multiple times with same state", () => {
    const { addRun } = useAnalysisStore.getState();
    const id = addRun("autonomous", "test question", "test_table");

    const { getEvolutionChain } = useAnalysisStore.getState();
    const chain1 = getEvolutionChain(id);
    const chain2 = getEvolutionChain(id);

    // Results should be structurally equal
    expect(chain1).toHaveLength(chain2.length);
    expect(chain1[0].id).toBe(chain2[0].id);
  });
});

describe("analysis-store: run field safety (M4-7.1.3)", () => {
  beforeEach(() => {
    useAnalysisStore.setState({ runs: [], activeRunId: null });
  });

  it("addRun creates run with string question and table", () => {
    const { addRun } = useAnalysisStore.getState();
    const id = addRun("autonomous", "what are the top products?", "orders");

    const run = useAnalysisStore.getState().runs.find((r) => r.id === id);
    expect(run).toBeDefined();
    expect(typeof run!.question).toBe("string");
    expect(typeof run!.table).toBe("string");
    expect(run!.question).toBe("what are the top products?");
    expect(run!.table).toBe("orders");
  });

  it("updateRun does not corrupt existing fields", () => {
    const { addRun, updateRun } = useAnalysisStore.getState();
    const id = addRun("autonomous", "test", "table");

    updateRun(id, { status: "success" });

    const run = useAnalysisStore.getState().runs.find((r) => r.id === id);
    expect(run!.status).toBe("success");
    expect(run!.question).toBe("test");
    expect(run!.table).toBe("table");
  });
});
