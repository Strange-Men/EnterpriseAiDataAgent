import { describe, it, expect, beforeEach, vi } from "vitest";
import { logger } from "../../services/logger";

describe("logger", () => {
  beforeEach(() => {
    logger.clear();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should log debug messages", () => {
    logger.debug("ui", "test message");
    const logs = logger.getRecent();
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe("debug");
    expect(logs[0].category).toBe("ui");
    expect(logs[0].message).toBe("test message");
  });

  it("should log info messages", () => {
    logger.info("system", "info message");
    const logs = logger.getRecent();
    expect(logs[0].level).toBe("info");
    expect(logs[0].category).toBe("system");
  });

  it("should log warn messages", () => {
    logger.warn("api", "warning");
    const logs = logger.getRecent();
    expect(logs[0].level).toBe("warn");
  });

  it("should log error messages", () => {
    logger.error("query", "error message");
    const logs = logger.getRecent();
    expect(logs[0].level).toBe("error");
  });

  it("should log with data", () => {
    logger.info("store", "msg", { key: "value" });
    const logs = logger.getRecent();
    expect(logs[0].data).toEqual({ key: "value" });
  });

  it("should log API calls with correct level", () => {
    logger.api("GET", "/tables", 200, 50);
    let logs = logger.getRecent();
    expect(logs[0].level).toBe("info");
    expect(logs[0].message).toContain("GET");

    logger.clear();
    logger.api("POST", "/query", 400, 10);
    logs = logger.getRecent();
    expect(logs[0].level).toBe("warn");

    logger.clear();
    logger.api("POST", "/query", 500, 10);
    logs = logger.getRecent();
    expect(logs[0].level).toBe("error");
  });

  it("should log query execution", () => {
    logger.query("SELECT 1", 1, 5);
    const logs = logger.getRecent();
    expect(logs[0].level).toBe("info");
    expect(logs[0].message).toContain("OK");
  });

  it("should log query errors", () => {
    logger.query("SELECT bad", 0, 2, "Table not found");
    const logs = logger.getRecent();
    expect(logs[0].level).toBe("error");
    expect(logs[0].message).toBe("Table not found");
  });

  it("should get recent logs with count limit", () => {
    for (let i = 0; i < 10; i++) {
      logger.info("system", `msg ${i}`);
    }
    const logs = logger.getRecent(3);
    expect(logs).toHaveLength(3);
    expect(logs[2].message).toBe("msg 9");
  });

  it("should maintain max log limit", () => {
    for (let i = 0; i < 510; i++) {
      logger.info("system", `msg ${i}`);
    }
    const logs = logger.getRecent();
    expect(logs.length).toBeLessThanOrEqual(500);
  });

  it("should clear logs", () => {
    logger.info("system", "msg");
    logger.clear();
    expect(logger.getRecent()).toHaveLength(0);
  });

  it("should truncate SQL in query log data", () => {
    const longSql = "SELECT ".repeat(50);
    logger.query(longSql, 1, 5);
    const logs = logger.getRecent();
    const data = logs[0].data as Record<string, unknown>;
    expect((data.sql as string).length).toBeLessThanOrEqual(200);
  });
});
