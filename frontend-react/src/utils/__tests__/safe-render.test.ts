import { describe, it, expect } from "vitest";
import {
  renderSafeText,
  safeMarkdownContent,
  safeArray,
  safeErrorText,
} from "../safe-render";

describe("renderSafeText", () => {
  it("returns string as-is", () => {
    expect(renderSafeText("hello")).toBe("hello");
  });

  it("converts number to string", () => {
    expect(renderSafeText(42)).toBe("42");
  });

  it("converts boolean to string", () => {
    expect(renderSafeText(true)).toBe("true");
  });

  it("returns fallback for null", () => {
    expect(renderSafeText(null)).toBe("");
    expect(renderSafeText(null, "N/A")).toBe("N/A");
  });

  it("returns fallback for undefined", () => {
    expect(renderSafeText(undefined)).toBe("");
  });

  it("returns fallback for object", () => {
    expect(renderSafeText({ foo: "bar" })).toBe("");
    expect(renderSafeText({ foo: "bar" }, "[object]")).toBe("[object]");
  });

  it("returns fallback for array", () => {
    expect(renderSafeText([1, 2, 3])).toBe("");
  });

  it("returns fallback for event-like object (React #31 defense)", () => {
    const fakeEvent = {
      _reactName: "onClick",
      _targetInst: {},
      type: "click",
      nativeEvent: {},
      target: {},
      currentTarget: {},
    };
    expect(renderSafeText(fakeEvent, "[event]")).toBe("[event]");
  });

  it("returns fallback for Error object", () => {
    expect(renderSafeText(new Error("test"), "[error]")).toBe("[error]");
  });
});

describe("safeMarkdownContent", () => {
  it("returns non-empty string as-is", () => {
    expect(safeMarkdownContent("# Title\nContent")).toBe("# Title\nContent");
  });

  it("returns fallback for empty string", () => {
    expect(safeMarkdownContent("")).toBe("");
    expect(safeMarkdownContent("   ")).toBe("");
  });

  it("returns fallback for non-string", () => {
    expect(safeMarkdownContent(null)).toBe("");
    expect(safeMarkdownContent(undefined)).toBe("");
    expect(safeMarkdownContent({ key: "value" })).toBe("");
    expect(safeMarkdownContent(123)).toBe("");
  });

  it("returns custom fallback for non-string", () => {
    expect(safeMarkdownContent(null, "No content")).toBe("No content");
  });
});

describe("safeArray", () => {
  it("returns array as-is", () => {
    const arr = [1, 2, 3];
    expect(safeArray(arr)).toBe(arr);
  });

  it("returns empty array for null", () => {
    expect(safeArray(null)).toEqual([]);
  });

  it("returns empty array for undefined", () => {
    expect(safeArray(undefined)).toEqual([]);
  });

  it("returns empty array for non-array", () => {
    expect(safeArray("string")).toEqual([]);
    expect(safeArray(123)).toEqual([]);
    expect(safeArray({ key: "value" })).toEqual([]);
  });

  it("returns empty array for empty array", () => {
    expect(safeArray([])).toEqual([]);
  });
});

describe("safeErrorText", () => {
  it("extracts message from Error", () => {
    expect(safeErrorText(new Error("test error"))).toBe("test error");
  });

  it("returns string as-is", () => {
    expect(safeErrorText("error string")).toBe("error string");
  });

  it("extracts message from error-like object", () => {
    expect(safeErrorText({ message: "obj error" })).toBe("obj error");
  });

  it("extracts error from error-like object", () => {
    expect(safeErrorText({ error: "nested error" })).toBe("nested error");
  });

  it("returns default for plain object", () => {
    expect(safeErrorText({ foo: "bar" })).toBe("An unexpected error occurred");
  });

  it("returns default for null", () => {
    expect(safeErrorText(null)).toBe("An unexpected error occurred");
  });
});
