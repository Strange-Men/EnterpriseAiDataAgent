import { describe, it, expect, beforeEach } from "vitest";
import { useInvestigationStore } from "../investigation-store";

describe("workflow (via investigation-store)", () => {
  beforeEach(() => {
    useInvestigationStore.getState().reset();
  });

  it("should have idle initial state", () => {
    const state = useInvestigationStore.getState();
    expect(state.stage).toBe("idle");
    expect(state.activeTable).toBeNull();
    expect(state.lastSql).toBeNull();
    expect(state.startedAt).toBeNull();
    expect(state.source).toBeNull();
  });

  it("should advance stage and set table", () => {
    const { advance } = useInvestigationStore.getState();
    advance("uploading", { table: "sales" });
    const state = useInvestigationStore.getState();
    expect(state.stage).toBe("uploading");
    expect(state.activeTable).toBe("sales");
    expect(state.startedAt).toBeTruthy();
    expect(state.source).toBe("upload");
  });

  it("should preserve activeTable when advancing without table", () => {
    const { advance } = useInvestigationStore.getState();
    advance("uploading", { table: "sales" });
    advance("profiling");
    expect(useInvestigationStore.getState().activeTable).toBe("sales");
    expect(useInvestigationStore.getState().stage).toBe("profiling");
  });

  it("should set lastSql on sql-ready stage", () => {
    const { advance } = useInvestigationStore.getState();
    advance("analyzing", { table: "sales" });
    advance("sql-ready", { sql: "SELECT * FROM sales LIMIT 100" });
    const state = useInvestigationStore.getState();
    expect(state.stage).toBe("sql-ready");
    expect(state.lastSql).toBe("SELECT * FROM sales LIMIT 100");
  });

  it("should preserve source and startedAt across advances", () => {
    const { advance } = useInvestigationStore.getState();
    advance("uploading", { table: "t1" });
    const firstStarted = useInvestigationStore.getState().startedAt;
    advance("profiling");
    advance("analyzing");
    expect(useInvestigationStore.getState().source).toBe("upload");
    expect(useInvestigationStore.getState().startedAt).toBe(firstStarted);
  });

  it("should set source to manual when not from upload", () => {
    const { advance } = useInvestigationStore.getState();
    advance("analyzing", { table: "t1" });
    expect(useInvestigationStore.getState().source).toBe("manual");
  });

  it("should reset to idle", () => {
    const { advance, reset } = useInvestigationStore.getState();
    advance("sql-ready", { table: "t1", sql: "SELECT 1" });
    reset();
    const state = useInvestigationStore.getState();
    expect(state.stage).toBe("idle");
    expect(state.activeTable).toBeNull();
    expect(state.lastSql).toBeNull();
    expect(state.startedAt).toBeNull();
    expect(state.source).toBeNull();
  });
});
