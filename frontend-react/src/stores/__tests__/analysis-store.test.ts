import { describe, it, expect, beforeEach } from "vitest";
import { useAnalysisStore } from "../analysis-store";

describe("analysis-store", () => {
  beforeEach(() => {
    useAnalysisStore.setState({
      runs: [],
      activeRunId: null,
    });
  });

  it("should have empty initial state", () => {
    const state = useAnalysisStore.getState();
    expect(state.runs).toEqual([]);
    expect(state.activeRunId).toBeNull();
  });

  it("should add a run", () => {
    const { addRun } = useAnalysisStore.getState();
    const id = addRun("explain", "What is total revenue?", "sales");
    const state = useAnalysisStore.getState();
    expect(state.runs).toHaveLength(1);
    expect(state.runs[0].id).toBe(id);
    expect(state.runs[0].mode).toBe("explain");
    expect(state.runs[0].question).toBe("What is total revenue?");
    expect(state.runs[0].table).toBe("sales");
    expect(state.runs[0].status).toBe("running");
    expect(state.runs[0].saved).toBe(false);
    expect(state.runs[0].version).toBe(1);
    expect(state.activeRunId).toBe(id);
  });

  it("should update a run", () => {
    const { addRun, updateRun } = useAnalysisStore.getState();
    const id = addRun("explain", "test");
    updateRun(id, { status: "success", sections: [{ title: "Result", content: "42", type: "markdown" }] });
    const run = useAnalysisStore.getState().runs[0];
    expect(run.status).toBe("success");
    expect(run.sections).toHaveLength(1);
  });

  it("should save and unsave a run", () => {
    const { addRun, saveRun, unsaveRun } = useAnalysisStore.getState();
    const id = addRun("explain", "test");
    saveRun(id);
    expect(useAnalysisStore.getState().runs[0].saved).toBe(true);
    unsaveRun(id);
    expect(useAnalysisStore.getState().runs[0].saved).toBe(false);
  });

  it("should delete a run", () => {
    const { addRun, deleteRun } = useAnalysisStore.getState();
    const id = addRun("explain", "test");
    deleteRun(id);
    expect(useAnalysisStore.getState().runs).toHaveLength(0);
    expect(useAnalysisStore.getState().activeRunId).toBeNull();
  });

  it("should clear history but keep saved runs", () => {
    const { addRun, saveRun, clearHistory } = useAnalysisStore.getState();
    const id1 = addRun("explain", "saved one");
    saveRun(id1);
    addRun("insights", "unsaved one");
    clearHistory();
    const state = useAnalysisStore.getState();
    expect(state.runs).toHaveLength(1);
    expect(state.runs[0].id).toBe(id1);
  });

  it("should duplicate a run", () => {
    const { addRun, updateRun, duplicateRun } = useAnalysisStore.getState();
    const id = addRun("autonomous", "Analyze sales trends", "sales");
    updateRun(id, { status: "success", sections: [{ title: "s", content: "c", type: "markdown" }] });

    const newId = duplicateRun(id);
    expect(newId).toBeTruthy();
    expect(newId).not.toBe(id);

    const state = useAnalysisStore.getState();
    expect(state.runs).toHaveLength(2);

    const dup = state.runs.find((r) => r.id === newId)!;
    expect(dup.mode).toBe("autonomous");
    expect(dup.question).toBe("Analyze sales trends");
    expect(dup.table).toBe("sales");
    expect(dup.status).toBe("running");
    expect(dup.saved).toBe(false);
    expect(dup.parentRunId).toBe(id);
    expect(dup.sections).toEqual([]);
  });

  it("should return null for duplicateRun with invalid id", () => {
    const { duplicateRun } = useAnalysisStore.getState();
    expect(duplicateRun("nonexistent")).toBeNull();
  });

  it("should update run notes", () => {
    const { addRun, updateRunNotes } = useAnalysisStore.getState();
    const id = addRun("explain", "test");
    updateRunNotes(id, "This is a great analysis");
    expect(useAnalysisStore.getState().runs[0].notes).toBe("This is a great analysis");
  });

  it("should overwrite run notes", () => {
    const { addRun, updateRunNotes } = useAnalysisStore.getState();
    const id = addRun("explain", "test");
    updateRunNotes(id, "first note");
    updateRunNotes(id, "updated note");
    expect(useAnalysisStore.getState().runs[0].notes).toBe("updated note");
  });

  it("should recover interrupted runs", () => {
    const { addRun, recoverInterruptedRuns } = useAnalysisStore.getState();
    addRun("explain", "running one");
    addRun("insights", "another running");

    // Both are in "running" status
    expect(useAnalysisStore.getState().runs.every((r) => r.status === "running")).toBe(true);

    recoverInterruptedRuns();

    const state = useAnalysisStore.getState();
    expect(state.runs.every((r) => r.status === "error")).toBe(true);
    expect(state.runs.every((r) => r.error === "Session interrupted — run was not completed")).toBe(true);
  });

  it("should not affect completed runs during recovery", () => {
    const { addRun, updateRun, recoverInterruptedRuns } = useAnalysisStore.getState();
    const id1 = addRun("explain", "completed");
    updateRun(id1, { status: "success" });
    addRun("insights", "still running");

    recoverInterruptedRuns();

    const state = useAnalysisStore.getState();
    const completed = state.runs.find((r) => r.id === id1)!;
    const interrupted = state.runs.find((r) => r.id !== id1)!;
    expect(completed.status).toBe("success");
    expect(interrupted.status).toBe("error");
  });

  it("should export a run as JSON", () => {
    const { addRun, exportRun } = useAnalysisStore.getState();
    const id = addRun("explain", "test");
    const json = exportRun(id);
    expect(json).toBeTruthy();
    const parsed = JSON.parse(json!);
    expect(parsed.id).toBe(id);
    expect(parsed.question).toBe("test");
  });

  it("should return null for exportRun with invalid id", () => {
    const { exportRun } = useAnalysisStore.getState();
    expect(exportRun("nonexistent")).toBeNull();
  });

  it("should rerun with incremented version and parent link", () => {
    const { addRun, updateRun, rerunRun } = useAnalysisStore.getState();
    const id = addRun("explain", "original");
    updateRun(id, { status: "success" });

    const newId = rerunRun(id);
    expect(newId).toBeTruthy();

    const newRun = useAnalysisStore.getState().runs.find((r) => r.id === newId)!;
    expect(newRun.version).toBe(2);
    expect(newRun.parentRunId).toBe(id);
    expect(newRun.question).toBe("original");
  });

  it("should get active run", () => {
    const { addRun, getActiveRun } = useAnalysisStore.getState();
    const id = addRun("explain", "test");
    const active = getActiveRun();
    expect(active).toBeTruthy();
    expect(active!.id).toBe(id);
  });

  it("should set active run to null", () => {
    const { addRun, setActiveRun, getActiveRun } = useAnalysisStore.getState();
    addRun("explain", "test");
    setActiveRun(null);
    expect(getActiveRun()).toBeNull();
  });

  // ── v0.7.1: Drill-Down ───────────────────────────────────────

  describe("drillDownRun", () => {
    it("should create a drill-down run with correct fields", () => {
      const { addRun, updateRun, drillDownRun } = useAnalysisStore.getState();
      const sourceId = addRun("insights", "Analyze revenue", "sales");
      updateRun(sourceId, { status: "success" });

      const ddId = drillDownRun(sourceId, 0, "Revenue dropped 20% in Q3");
      expect(ddId).toBeTruthy();
      expect(ddId).not.toBe(sourceId);

      const state = useAnalysisStore.getState();
      expect(state.runs).toHaveLength(2);

      const ddRun = state.runs.find((r) => r.id === ddId)!;
      expect(ddRun.mode).toBe("autonomous");
      expect(ddRun.question).toBe("Investigate further: Revenue dropped 20% in Q3");
      expect(ddRun.table).toBe("sales");
      expect(ddRun.parentRunId).toBe(sourceId);
      expect(ddRun.drillDownFrom).toEqual({
        runId: sourceId,
        findingIndex: 0,
        findingText: "Revenue dropped 20% in Q3",
      });
    });

    it("should return null for drillDownRun with invalid id", () => {
      const { drillDownRun } = useAnalysisStore.getState();
      expect(drillDownRun("nonexistent", 0, "test")).toBeNull();
    });

    it("should include drill-down runs in evolution chain", () => {
      const { addRun, updateRun, drillDownRun, getEvolutionChain } = useAnalysisStore.getState();
      const sourceId = addRun("insights", "Original question", "sales");
      updateRun(sourceId, { status: "success" });

      const ddId = drillDownRun(sourceId, 0, "Finding text");

      const chain = getEvolutionChain(sourceId);
      expect(chain).toHaveLength(2);
      expect(chain[0].id).toBe(sourceId);
      expect(chain[1].id).toBe(ddId);
    });
  });
});
