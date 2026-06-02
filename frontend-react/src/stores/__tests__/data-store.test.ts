import { describe, it, expect, beforeEach } from "vitest";
import { useDataStore } from "../data-store";

describe("data-store", () => {
  beforeEach(() => {
    useDataStore.setState({
      dbStatus: "idle",
      tables: [],
      currentData: null,
      currentColumns: [],
      qualityReport: null,
      uploadedFiles: [],
      systemStatus: {
        api: "unknown",
        db: "unknown",
        version: "0.3.3",
        uptime: "0:00:00",
      },
    });
  });

  it("should have correct initial state", () => {
    const state = useDataStore.getState();
    expect(state.dbStatus).toBe("idle");
    expect(state.tables).toEqual([]);
    expect(state.currentData).toBeNull();
    expect(state.currentColumns).toEqual([]);
    expect(state.qualityReport).toBeNull();
    expect(state.uploadedFiles).toEqual([]);
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
    setTables(tables as unknown as Parameters<typeof setTables>[0]);
    expect(useDataStore.getState().tables).toEqual(tables);
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
    const report = { overallScore: 85, warnings: [] } as unknown as Parameters<typeof setQualityReport>[0];
    setQualityReport(report);
    expect(useDataStore.getState().qualityReport).toEqual(report);

    setQualityReport(null);
    expect(useDataStore.getState().qualityReport).toBeNull();
  });

  it("should set uploaded files", () => {
    const { setUploadedFiles } = useDataStore.getState();
    const files = [{ name: "data.csv", size: "1KB", type: "csv", uploadedAt: "now", rowCount: 10, columnCount: 3, status: "success" }];
    setUploadedFiles(files as unknown as Parameters<typeof setUploadedFiles>[0]);
    expect(useDataStore.getState().uploadedFiles).toEqual(files);
  });

  it("should set system status with partial update", () => {
    const { setSystemStatus } = useDataStore.getState();
    setSystemStatus({ api: "ok", db: "ok" });
    const status = useDataStore.getState().systemStatus;
    expect(status.api).toBe("ok");
    expect(status.db).toBe("ok");
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
