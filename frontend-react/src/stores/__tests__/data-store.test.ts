import { describe, it, expect, beforeEach } from "vitest";
import { useDataStore } from "../data-store";

describe("data-store", () => {
  beforeEach(() => {
    useDataStore.setState({
      dbStatus: "idle",
      tables: [],
      currentTable: null,
      currentData: null,
      currentColumns: [],
      qualityReport: null,
      uploadedFiles: [],
      chatHistory: [],
      agentLogs: [],
      systemStatus: {
        api: "unknown",
        db: "unknown",
        rag: "unknown",
        version: "0.3.3",
        uptime: "0:00:00",
      },
    });
  });

  it("should have correct initial state", () => {
    const state = useDataStore.getState();
    expect(state.dbStatus).toBe("idle");
    expect(state.tables).toEqual([]);
    expect(state.currentTable).toBeNull();
    expect(state.currentData).toBeNull();
    expect(state.currentColumns).toEqual([]);
    expect(state.qualityReport).toBeNull();
    expect(state.uploadedFiles).toEqual([]);
    expect(state.chatHistory).toEqual([]);
    expect(state.agentLogs).toEqual([]);
  });

  it("should set dbStatus", () => {
    const { setDbStatus } = useDataStore.getState();
    setDbStatus("connected");
    expect(useDataStore.getState().dbStatus).toBe("connected");

    setDbStatus("error");
    expect(useDataStore.getState().dbStatus).toBe("error");
  });

  it("should set tables", () => {
    const { setTables } = useDataStore.getState();
    const tables = [
      { name: "users", rowCount: 100, columnCount: 5 },
      { name: "orders", rowCount: 500, columnCount: 8 },
    ];
    setTables(tables as any);
    expect(useDataStore.getState().tables).toEqual(tables);
  });

  it("should set current table", () => {
    const { setCurrentTable } = useDataStore.getState();
    setCurrentTable("users");
    expect(useDataStore.getState().currentTable).toBe("users");

    setCurrentTable(null);
    expect(useDataStore.getState().currentTable).toBeNull();
  });

  it("should set current data with columns", () => {
    const { setCurrentData } = useDataStore.getState();
    const data = [{ id: 1, name: "Alice" }];
    setCurrentData(data, ["id", "name"]);
    expect(useDataStore.getState().currentData).toEqual(data);
    expect(useDataStore.getState().currentColumns).toEqual(["id", "name"]);
  });

  it("should set current data without columns", () => {
    const { setCurrentData } = useDataStore.getState();
    const data = [{ id: 1 }];
    setCurrentData(data);
    expect(useDataStore.getState().currentData).toEqual(data);
    expect(useDataStore.getState().currentColumns).toEqual([]);
  });

  it("should set quality report", () => {
    const { setQualityReport } = useDataStore.getState();
    const report = { overallScore: 85, warnings: [] } as any;
    setQualityReport(report);
    expect(useDataStore.getState().qualityReport).toEqual(report);

    setQualityReport(null);
    expect(useDataStore.getState().qualityReport).toBeNull();
  });

  it("should set uploaded files", () => {
    const { setUploadedFiles } = useDataStore.getState();
    const files = [{ name: "data.csv", size: "1KB", type: "csv", uploadedAt: "now", rowCount: 10, columnCount: 3, status: "success" }];
    setUploadedFiles(files as any);
    expect(useDataStore.getState().uploadedFiles).toEqual(files);
  });

  it("should add chat messages", () => {
    const { addChatMessage } = useDataStore.getState();
    const msg1 = { role: "user" as const, content: "Hello", timestamp: "t1" };
    const msg2 = { role: "assistant" as const, content: "Hi!", timestamp: "t2" };
    addChatMessage(msg1);
    addChatMessage(msg2);
    const history = useDataStore.getState().chatHistory;
    expect(history).toHaveLength(2);
    expect(history[0].content).toBe("Hello");
    expect(history[1].content).toBe("Hi!");
  });

  it("should add agent logs", () => {
    const { addAgentLog } = useDataStore.getState();
    const log = { agent: "sql", action: "execute", status: "running" as const, detail: "querying", time: "now" };
    addAgentLog(log);
    expect(useDataStore.getState().agentLogs).toHaveLength(1);
    expect(useDataStore.getState().agentLogs[0].agent).toBe("sql");
  });

  it("should set system status with partial update", () => {
    const { setSystemStatus } = useDataStore.getState();
    setSystemStatus({ api: "ok", db: "ok" });
    const status = useDataStore.getState().systemStatus;
    expect(status.api).toBe("ok");
    expect(status.db).toBe("ok");
    expect(status.rag).toBe("unknown"); // unchanged
    expect(status.version).toBe("0.3.3"); // unchanged
  });

  it("should set system status with version and uptime", () => {
    const { setSystemStatus } = useDataStore.getState();
    setSystemStatus({ version: "0.4.0", uptime: "1:23:45" });
    const status = useDataStore.getState().systemStatus;
    expect(status.version).toBe("0.4.0");
    expect(status.uptime).toBe("1:23:45");
  });
});
