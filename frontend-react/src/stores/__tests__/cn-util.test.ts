import { describe, it, expect } from "vitest";
import { cn } from "../../utils/cn";

describe("cn utility", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", true && "active")).toBe("base active");
    expect(cn("base", false && "active")).toBe("base");
  });

  it("should handle undefined and null", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("should merge tailwind classes correctly", () => {
    // twMerge should resolve conflicts
    const result = cn("p-4", "p-2");
    expect(result).toBe("p-2");
  });

  it("should handle arrays", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("should handle empty input", () => {
    expect(cn()).toBe("");
  });
});
