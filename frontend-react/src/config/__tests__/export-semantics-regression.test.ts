/**
 * Regression tests for M4-7.1.5 — Save / Export / Template UX Semantics.
 *
 * Ensures feature flags and export semantics are correctly configured.
 */
import { describe, it, expect } from "vitest";
import { featureFlags, isFeatureEnabled } from "../features";

describe("feature flags: M4-7.1.5 export semantics", () => {
  it("showTemplates remains disabled (deprecated)", () => {
    expect(featureFlags.showTemplates).toBe(false);
    expect(isFeatureEnabled("showTemplates")).toBe(false);
  });

  it("showSaveAsTemplate remains disabled (deprecated)", () => {
    expect(featureFlags.showSaveAsTemplate).toBe(false);
    expect(isFeatureEnabled("showSaveAsTemplate")).toBe(false);
  });

  it("showSchedule remains disabled (deprecated)", () => {
    expect(featureFlags.showSchedule).toBe(false);
  });

  it("showDiffCompare remains disabled (deprecated)", () => {
    expect(featureFlags.showDiffCompare).toBe(false);
  });

  it("showTimeline remains disabled (deprecated)", () => {
    expect(featureFlags.showTimeline).toBe(false);
  });

  it("showAutonomousMode is enabled (core feature)", () => {
    expect(featureFlags.showAutonomousMode).toBe(true);
  });
});
