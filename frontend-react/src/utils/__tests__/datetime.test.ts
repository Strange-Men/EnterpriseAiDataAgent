import { describe, it, expect } from "vitest";
import { formatLocalTime, formatLocalDateTime, formatRelativeTime } from "../datetime";

describe("formatLocalTime", () => {
  it("should format valid ISO timestamp as local time", () => {
    const result = formatLocalTime("2026-01-15T10:30:00.000Z");
    // Should return time in HH:MM format
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it("should return fallback for empty string", () => {
    expect(formatLocalTime("")).toBe("");
    expect(formatLocalTime("", "N/A")).toBe("N/A");
  });

  it("should return fallback for null/undefined", () => {
    expect(formatLocalTime(null)).toBe("");
    expect(formatLocalTime(undefined)).toBe("");
  });

  it("should return fallback for invalid date", () => {
    expect(formatLocalTime("not-a-date")).toBe("");
  });

  it("should use custom fallback", () => {
    expect(formatLocalTime(null, "--:--")).toBe("--:--");
  });
});

describe("formatLocalDateTime", () => {
  it("should format valid ISO timestamp as local date+time", () => {
    const result = formatLocalDateTime("2026-01-15T10:30:00.000Z");
    // Should return a non-empty string with date and time
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toBe("Invalid Date");
  });

  it("should return fallback for empty/null/undefined", () => {
    expect(formatLocalDateTime("")).toBe("");
    expect(formatLocalDateTime(null)).toBe("");
    expect(formatLocalDateTime(undefined)).toBe("");
  });

  it("should return fallback for invalid date", () => {
    expect(formatLocalDateTime("invalid")).toBe("");
  });
});

describe("formatRelativeTime", () => {
  it("should show '< 1 min' for recent timestamps", () => {
    const now = new Date();
    const result = formatRelativeTime(now.toISOString());
    expect(result).toBe("< 1 min");
  });

  it("should show minutes for timestamps within an hour", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const result = formatRelativeTime(fiveMinAgo.toISOString());
    expect(result).toBe("5 min");
  });

  it("should show hours for timestamps within a day", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const result = formatRelativeTime(threeHoursAgo.toISOString());
    expect(result).toBe("3h");
  });

  it("should show days for timestamps within a week", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(twoDaysAgo.toISOString());
    expect(result).toBe("2d");
  });

  it("should show local date for old timestamps", () => {
    const oldDate = new Date("2020-01-01T00:00:00.000Z");
    const result = formatRelativeTime(oldDate.toISOString());
    // Should return a date string, not relative time
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toMatch(/^\d+[mhd]$/);
  });

  it("should return fallback for empty/null/undefined", () => {
    expect(formatRelativeTime("")).toBe("");
    expect(formatRelativeTime(null)).toBe("");
    expect(formatRelativeTime(undefined)).toBe("");
  });

  it("should return fallback for invalid date", () => {
    expect(formatRelativeTime("not-a-date")).toBe("");
  });

  it("should return fallback for future timestamps", () => {
    const future = new Date(Date.now() + 1000000);
    expect(formatRelativeTime(future.toISOString())).toBe("");
  });
});

describe("datetime formatting consistency", () => {
  it("should use same Date parsing for all formatters", () => {
    // Use a past timestamp so formatRelativeTime returns a value
    const iso = "2020-01-15T14:30:00.000Z";

    // All three should accept the same input without throwing
    const time = formatLocalTime(iso);
    const dateTime = formatLocalDateTime(iso);
    const relative = formatRelativeTime(iso);

    expect(time).toBeTruthy();
    expect(dateTime).toBeTruthy();
    expect(relative).toBeTruthy();
  });

  it("should all handle the same invalid input gracefully", () => {
    const invalid = "not-a-date";

    expect(formatLocalTime(invalid)).toBe("");
    expect(formatLocalDateTime(invalid)).toBe("");
    expect(formatRelativeTime(invalid)).toBe("");
  });
});
