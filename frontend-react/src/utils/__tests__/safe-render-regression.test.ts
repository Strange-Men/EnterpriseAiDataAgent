/**
 * Regression tests for M4-7.1.3 — Safe render for event-like objects.
 *
 * Ensures React event objects and other non-renderable values
 * are safely converted to strings, preventing React #185 / #31.
 */
import { describe, it, expect } from "vitest";
import { renderSafeText, safeMarkdownContent } from "../safe-render";

describe("safe-render: event-like object defense (M4-7.1.3)", () => {
  it("returns fallback for React SyntheticEvent-like object", () => {
    const syntheticEvent = {
      _reactName: "onClick",
      _targetInst: {},
      type: "click",
      nativeEvent: {},
      target: { value: "test" },
      currentTarget: { value: "test" },
      bubbles: true,
      cancelable: true,
      defaultPrevented: false,
      eventPhase: 3,
      isTrusted: true,
      timeStamp: Date.now(),
    };
    expect(renderSafeText(syntheticEvent, "[event]")).toBe("[event]");
  });

  it("returns fallback for MouseEvent-like object", () => {
    const mouseEvent = {
      type: "click",
      clientX: 100,
      clientY: 200,
      button: 0,
      altKey: false,
      ctrlKey: false,
      shiftKey: false,
      metaKey: false,
    };
    expect(renderSafeText(mouseEvent, "[mouse]")).toBe("[mouse]");
  });

  it("returns fallback for React Fiber node-like object", () => {
    const fiberNode = {
      tag: 5,
      key: null,
      elementType: "div",
      type: "div",
      stateNode: {},
      return: {},
      child: null,
      sibling: null,
    };
    expect(renderSafeText(fiberNode, "[fiber]")).toBe("[fiber]");
  });

  it("safeMarkdownContent returns fallback for event-like object", () => {
    const fakeEvent = { type: "click", target: {} };
    expect(safeMarkdownContent(fakeEvent, "No content")).toBe("No content");
  });

  it("safeMarkdownContent returns fallback for empty string", () => {
    expect(safeMarkdownContent("", "No content")).toBe("No content");
    expect(safeMarkdownContent("   ", "No content")).toBe("No content");
  });

  it("renderSafeText handles nested event-like object", () => {
    const nestedEvent = {
      nativeEvent: {
        type: "click",
        target: {},
      },
      type: "click",
      _reactName: "onClick",
    };
    expect(renderSafeText(nestedEvent)).toBe("");
  });

  it("renderSafeText returns string values as-is", () => {
    expect(renderSafeText("hello world")).toBe("hello world");
  });

  it("renderSafeText converts numbers to string", () => {
    expect(renderSafeText(42)).toBe("42");
    expect(renderSafeText(0)).toBe("0");
    expect(renderSafeText(-1)).toBe("-1");
  });

  it("renderSafeText converts booleans to string", () => {
    expect(renderSafeText(true)).toBe("true");
    expect(renderSafeText(false)).toBe("false");
  });
});
