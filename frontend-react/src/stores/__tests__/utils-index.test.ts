import { describe, it, expect } from "vitest";
import { truncate, formatNumber, formatBytes } from "../../utils/index";

describe("truncate", () => {
  it("should not truncate short text", () => {
    const result = truncate("hello", 10);
    expect(result.display).toBe("hello");
    expect(result.full).toBe("hello");
    expect(result.truncated).toBe(false);
  });

  it("should truncate long text", () => {
    const result = truncate("hello world, this is long", 10);
    expect(result.display).toBe("hello worl...");
    expect(result.full).toBe("hello world, this is long");
    expect(result.truncated).toBe(true);
  });

  it("should use default max length of 20", () => {
    const short = truncate("short");
    expect(short.truncated).toBe(false);

    const long = truncate("this is a very long string that exceeds twenty chars");
    expect(long.truncated).toBe(true);
    expect(long.display.length).toBe(23); // 20 + "..."
  });

  it("should handle empty string", () => {
    const result = truncate("", 10);
    expect(result.display).toBe("");
    expect(result.truncated).toBe(false);
  });

  it("should handle exact boundary", () => {
    const result = truncate("12345", 5);
    expect(result.truncated).toBe(false);
    expect(result.display).toBe("12345");
  });
});

describe("formatNumber", () => {
  it("should format number with en locale", () => {
    expect(formatNumber(1000, "en")).toBe("1,000");
  });

  it("should format large numbers", () => {
    expect(formatNumber(1000000, "en")).toBe("1,000,000");
  });

  it("should handle zero", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("should handle negative numbers", () => {
    const result = formatNumber(-5000, "en");
    expect(result).toContain("5,000");
  });
});

describe("formatBytes", () => {
  it("should format bytes", () => {
    expect(formatBytes(500)).toBe("500 B");
  });

  it("should format kilobytes", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(2048)).toBe("2.0 KB");
  });

  it("should format megabytes", () => {
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
    expect(formatBytes(1024 * 1024 * 5)).toBe("5.0 MB");
  });

  it("should handle zero", () => {
    expect(formatBytes(0)).toBe("0 B");
  });
});
