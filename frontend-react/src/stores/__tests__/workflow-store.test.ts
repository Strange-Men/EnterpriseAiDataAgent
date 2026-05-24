import { describe, it, expect, beforeEach } from "vitest";
import { useWorkflowStore } from "../workflow-store";

describe("workflow-store", () => {
  beforeEach(() => {
    useWorkflowStore.setState({
      stage: "idle",
      activeTable: null,
      aiSql: null,
      startedAt: null,
      source: null,
    });
  });

  it("should have idle initial state", () => {
    const state = useWorkflowStore.getState();
    expect(state.stage).toBe("idle");
    expect(state.activeTable).toBeNull();
    expect(state.aiSql).toBeNull();
    expect(state.startedAt).toBeNull();
    expect(state.source).toBeNull();
  });

  it("should advance stage and set table", () => {
    const { advance } = useWorkflowStore.getState();
    advance("uploading", { table: "sales" });
    const state = useWorkflowStore.getState();
    expect(state.stage).toBe("uploading");
    expect(state.activeTable).toBe("sales");
    expect(state.startedAt).toBeTruthy();
    expect(state.source).toBe("upload");
  });

  it("should preserve activeTable when advancing without table", () => {
    const { advance } = useWorkflowStore.getState();
    advance("uploading", { table: "sales" });
    advance("profiling");
    expect(useWorkflowStore.getState().activeTable).toBe("sales");
    expect(useWorkflowStore.getState().stage).toBe("profiling");
  });

  it("should set aiSql on sql-ready stage", () => {
    const { advance } = useWorkflowStore.getState();
    advance("analyzing", { table: "sales" });
    advance("sql-ready", { sql: "SELECT * FROM sales LIMIT 100" });
    const state = useWorkflowStore.getState();
    expect(state.stage).toBe("sql-ready");
    expect(state.aiSql).toBe("SELECT * FROM sales LIMIT 100");
  });

  it("should preserve source and startedAt across advances", () => {
    const { advance } = useWorkflowStore.getState();
    advance("uploading", { table: "t1" });
    const firstStarted = useWorkflowStore.getState().startedAt;
    advance("profiling");
    advance("analyzing");
    expect(useWorkflowStore.getState().source).toBe("upload");
    expect(useWorkflowStore.getState().startedAt).toBe(firstStarted);
  });

  it("should set source to manual when not from upload", () => {
    const { advance } = useWorkflowStore.getState();
    advance("analyzing", { table: "t1" });
    expect(useWorkflowStore.getState().source).toBe("manual");
  });

  it("should reset to idle", () => {
    const { advance, reset } = useWorkflowStore.getState();
    advance("sql-ready", { table: "t1", sql: "SELECT 1" });
    reset();
    const state = useWorkflowStore.getState();
    expect(state.stage).toBe("idle");
    expect(state.activeTable).toBeNull();
    expect(state.aiSql).toBeNull();
    expect(state.startedAt).toBeNull();
    expect(state.source).toBeNull();
  });
});
