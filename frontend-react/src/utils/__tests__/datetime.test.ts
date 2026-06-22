import { describe, it, expect } from "vitest";
import { formatLocalTime, formatLocalDateTime, formatRelativeTime } from "../datetime";

describe("formatLocalTime", () => {
  it("should format as HH:mm in 24-hour format", () => {
    // Use local Date constructor to avoid timezone shift
    const date = new Date(2026, 0, 1, 10, 30);
    expect(formatLocalTime(date)).toBe("10:30");
  });

  it("should not contain AM/PM", () => {
    expect(formatLocalTime(new Date(2026, 0, 1, 10, 30))).not.toMatch(/AM|PM/i);
    expect(formatLocalTime(new Date(2026, 0, 1, 22, 15))).not.toMatch(/AM|PM/i);
  });

  it("should pad single-digit hours and minutes", () => {
    expect(formatLocalTime(new Date(2026, 0, 1, 9, 5))).toBe("09:05");
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

  it("should match HH:mm pattern for various times", () => {
    expect(formatLocalTime(new Date(2026, 0, 1, 0, 0))).toMatch(/^\d{2}:\d{2}$/);
    expect(formatLocalTime(new Date(2026, 0, 1, 23, 59))).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe("formatLocalDateTime", () => {
  it("should format as YYYY-MM-DD HH:mm", () => {
    const date = new Date(2026, 0, 1, 9, 5);
    expect(formatLocalDateTime(date)).toBe("2026-01-01 09:05");
  });

  it("should format ISO input as local date+time", () => {
    const result = formatLocalDateTime("2026-01-15T10:30:00.000Z");
    // Should match YYYY-MM-DD HH:mm pattern
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
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
    // Should return a date string in YYYY-MM-DD format
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
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
