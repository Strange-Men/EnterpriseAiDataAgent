import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import {
  fetchTables,
  fetchTableData,
  fetchTableDataPaginated,
  fetchTableSchema,
  deleteTable,
  renameTable,
  executeQuery,
  fetchQueryHistory,
  explainQuery,
  cancelQuery,
  exportQueryResult,
  fetchAllSchemas,
  uploadFile,
  startUploadTask,
  fetchUploadTaskStatus,
  fetchQualityReport,
  fetchStatus,
  createAgentRun,
  aiQuery,
  unwrapApiResponse,
} from "../api";

beforeEach(() => {
  mockFetch.mockReset();
});

function mockJsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    blob: () => Promise.resolve(new Blob([JSON.stringify(data)])),
  };
}

describe("api service", () => {
  describe("fetchTables", () => {
    it("should fetch tables list", async () => {
      const tables = [{ name: "users", rowCount: 100, columnCount: 5 }];
      mockFetch.mockResolvedValueOnce(mockJsonResponse(tables));

      const result = await fetchTables();
      expect(result).toEqual(tables);
      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/api/tables", expect.any(Object));
    });

    it("should throw on error response", async () => {
      mockFetch.mockResolvedValueOnce(mockJsonResponse("Not found", 404));
      await expect(fetchTables()).rejects.toThrow("API 404");
    });
  });

  describe("fetchTableData", () => {
    it("should fetch table data with limit", async () => {
      const data = { columns: ["id"], data: [{ id: 1 }], rowCount: 1 };
      mockFetch.mockResolvedValueOnce(mockJsonResponse(data));

      const result = await fetchTableData("users", 50);
      expect(result.columns).toEqual(["id"]);
      expect(result.data).toEqual([{ id: 1 }]);
      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/api/tables/users?limit=50", expect.any(Object));
    });

    it("should encode table name in URL", async () => {
      mockFetch.mockResolvedValueOnce(mockJsonResponse({ columns: [], data: [], rowCount: 0 }));
      await fetchTableData("my table");
      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/api/tables/my%20table?limit=100", expect.any(Object));
    });
  });

  describe("fetchTableDataPaginated", () => {
    it("should fetch paginated data", async () => {
      const data = { columns: ["id"], data: [{ id: 1 }], page: 0, pageSize: 200, totalRows: 500, hasMore: true };
      mockFetch.mockResolvedValueOnce(mockJsonResponse(data));

      const result = await fetchTableDataPaginated("users");
      expect(result.page).toBe(0);
      expect(result.hasMore).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/api/tables/users/data?page=0&page_size=200", expect.any(Object));
    });
  });

  describe("fetchTableSchema", () => {
    it("should fetch table schema", async () => {
      const schema = [{ name: "id", dtype: "INTEGER", nullable: false, uniqueCount: 100 }];
      mockFetch.mockResolvedValueOnce(mockJsonResponse(schema));

      const result = await fetchTableSchema("users");
      expect(result).toEqual(schema);
    });
  });

  describe("deleteTable", () => {
    it("should send DELETE request", async () => {
      mockFetch.mockResolvedValueOnce(mockJsonResponse(null));
      await deleteTable("users");
      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/api/tables/users", expect.objectContaining({ method: "DELETE" }));
    });
  });

  describe("renameTable", () => {
    it("should send PUT request with new name", async () => {
      mockFetch.mockResolvedValueOnce(mockJsonResponse(null));
      await renameTable("old", "new");
      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/api/tables/old/rename", expect.objectContaining({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_name: "new" }),
      }));
    });
  });

  describe("executeQuery", () => {
    it("should execute SQL query", async () => {
      const result = { queryId: "query-1", sql: "SELECT 1", columns: ["val"], data: [{ val: 1 }], rowCount: 1, runtimeMs: 5, status: "success", error: null };
      mockFetch.mockResolvedValueOnce(mockJsonResponse(result));

      const res = await executeQuery("SELECT 1");
      expect(res.status).toBe("success");
      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/api/query", expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ sql: "SELECT 1", offset: 0, limit: 10000 }),
      }));
    });

    it("should pass abort signal", async () => {
      const controller = new AbortController();
      mockFetch.mockResolvedValueOnce(mockJsonResponse({ status: "success" }));
      await executeQuery("SELECT 1", 0, 100, controller.signal);
      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/api/query", expect.objectContaining({
        signal: controller.signal,
      }));
    });
  });

  describe("fetchQueryHistory", () => {
    it("should fetch history with limit", async () => {
      mockFetch.mockResolvedValueOnce(mockJsonResponse([]));
      await fetchQueryHistory(10);
      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/api/query/history?limit=10", expect.any(Object));
    });
  });

  describe("explainQuery", () => {
    it("should send explain request", async () => {
      const result = { sql: "SELECT 1", plan: [{ operator: "SEQ_SCAN", detail: "" }], status: "success", error: null };
      mockFetch.mockResolvedValueOnce(mockJsonResponse(result));

      const res = await explainQuery("SELECT 1");
      expect(res.status).toBe("success");
      expect(res.plan).toHaveLength(1);
    });
  });

  describe("cancelQuery", () => {
    it("should send cancel request", async () => {
      mockFetch.mockResolvedValueOnce(mockJsonResponse({ cancelled: true, queryId: "query-5" }));
      const res = await cancelQuery("query-5");
      expect(res.cancelled).toBe(true);
      expect(res.queryId).toBe("query-5");
    });
  });

  describe("exportQueryResult", () => {
    it("should return blob on success", async () => {
      mockFetch.mockResolvedValueOnce(mockJsonResponse("csv data"));
      const blob = await exportQueryResult("SELECT 1", "csv");
      expect(blob).toBeInstanceOf(Blob);
    });

    it("should throw on export failure", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: "Server Error", text: () => Promise.resolve("disk full") });
      await expect(exportQueryResult("SELECT 1", "csv")).rejects.toThrow("Export failed");
    });
  });

  describe("fetchAllSchemas", () => {
    it("should fetch all schemas", async () => {
      const schemas = { users: ["id", "name"], orders: ["id", "total"] };
      mockFetch.mockResolvedValueOnce(mockJsonResponse(schemas));
      const res = await fetchAllSchemas();
      expect(res).toEqual(schemas);
    });
  });

  describe("uploadFile", () => {
    it("should upload file through async task polling", async () => {
      mockFetch
        .mockResolvedValueOnce(mockJsonResponse({ task_id: "task-1", status: "pending", progress: 0, stage: "uploading" }))
        .mockResolvedValueOnce(mockJsonResponse({ task_id: "task-1", status: "success", progress: 100, stage: "done", table_name: "data" }));
      const file = new File(["a,b\n1,2"], "data.csv", { type: "text/csv" });
      const res = await uploadFile(file);
      expect(res.tableName).toBe("data");
      expect(mockFetch).toHaveBeenNthCalledWith(1, "http://localhost:8000/api/upload", expect.objectContaining({ method: "POST" }));
      expect(mockFetch).toHaveBeenNthCalledWith(2, "http://localhost:8000/api/tasks/task-1/status", expect.any(Object));
    });

    it("should expose upload task start and status helpers", async () => {
      mockFetch
        .mockResolvedValueOnce(mockJsonResponse({ task_id: "task-2", status: "pending", progress: 0, stage: "uploading" }))
        .mockResolvedValueOnce(mockJsonResponse({ task_id: "task-2", status: "failed", progress: 100, stage: "failed", error_message: "bad file" }));
      const file = new File(["bad"], "bad.csv", { type: "text/csv" });

      const task = await startUploadTask(file);
      const status = await fetchUploadTaskStatus(task.task_id);

      expect(task.task_id).toBe("task-2");
      expect(status.status).toBe("failed");
      expect(status.error_message).toBe("bad file");
    });
  });

  describe("fetchQualityReport", () => {
    it("should fetch quality report", async () => {
      const report = { overallScore: 90, warnings: [] };
      mockFetch.mockResolvedValueOnce(mockJsonResponse(report));
      const res = await fetchQualityReport("users");
      expect(res.overallScore).toBe(90);
    });
  });

  describe("fetchStatus", () => {
    it("should fetch system status", async () => {
      const status = { api: "ok", db: "ok", version: "0.4.0", uptime: "1:00:00" };
      mockFetch.mockResolvedValueOnce(mockJsonResponse(status));
      const res = await fetchStatus();
      expect(res.api).toBe("ok");
      expect(res.version).toBe("0.4.0");
    });
  });

  describe("aiQuery provider config", () => {
    it("should send selected LLM provider without API keys", async () => {
      mockFetch.mockResolvedValueOnce(mockJsonResponse({ sql: "SELECT 1", status: "success" }));

      await aiQuery("Show rows", false, false, undefined, "en", "sales", "deepseek");

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/api/ai/query", expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          question: "Show rows",
          execute: false,
          explain: false,
          language: "en",
          table: "sales",
          llm_provider: "deepseek",
        }),
      }));
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(Object.keys(body).join(" ")).not.toMatch(/API_KEY|api_key|secret/i);
    });
  });

  describe("createAgentRun locale", () => {
    it("should send locale as a first-class Agent run field", async () => {
      mockFetch.mockResolvedValueOnce(mockJsonResponse({ run: { run_id: "run-1", status: "completed" } }));

      await createAgentRun({
        user_input: "Assess business health",
        table_name: "demo_sales_business_50k",
        provider_requested: "mock",
        locale: "en-US",
        metadata: { language: "en" },
      });

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/api/agent/runs", expect.objectContaining({
        method: "POST",
      }));
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.locale).toBe("en-US");
      expect(body.metadata.language).toBe("en");
    });

    it("should default Agent run locale to zh-CN", async () => {
      mockFetch.mockResolvedValueOnce(mockJsonResponse({ run: { run_id: "run-2", status: "completed" } }));

      await createAgentRun({ user_input: "分析经营健康度" });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.locale).toBe("zh-CN");
    });
  });

  describe("response envelope helpers", () => {
    it("should return legacy responses unchanged", () => {
      const data = { value: 1 };
      expect(unwrapApiResponse(data)).toEqual(data);
    });

    it("should unwrap successful envelopes", () => {
      const data = { value: 1 };
      expect(unwrapApiResponse({ status: "success", data })).toEqual(data);
    });

    it("should throw on error envelopes", () => {
      expect(() => unwrapApiResponse({
        status: "error",
        data: null,
        error: { code: "BAD_REQUEST", message: "Bad request" },
      })).toThrow("Bad request");
    });
  });

  describe("error handling", () => {
    it("should handle invalid JSON response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error("invalid json")),
        text: () => Promise.resolve("not json at all"),
      });
      await expect(fetchTables()).rejects.toThrow("Invalid JSON response");
    });

    it("should handle empty error body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: () => Promise.resolve(""),
      });
      await expect(fetchTables()).rejects.toThrow("API 500: Internal Server Error");
    });
  });
});
