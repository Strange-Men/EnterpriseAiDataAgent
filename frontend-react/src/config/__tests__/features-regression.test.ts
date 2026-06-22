/**
 * Regression tests for M4-7.1.3 — Feature flag state.
 *
 * Ensures the NL-to-SQL flow is correctly enabled in Expert SQL workspace.
 */
import { describe, it, expect } from "vitest";
import { featureFlags, isFeatureEnabled } from "../features";

describe("feature flags: M4-7.1.3 NL-to-SQL regression", () => {
  it("showAiSqlInputInWorkspace is enabled (AI SQL input visible in Expert SQL)", () => {
    expect(featureFlags.showAiSqlInputInWorkspace).toBe(true);
    expect(isFeatureEnabled("showAiSqlInputInWorkspace")).toBe(true);
  });

  it("showAiButtonsInSqlWorkspace remains disabled (product decision)", () => {
    expect(featureFlags.showAiButtonsInSqlWorkspace).toBe(false);
  });

  it("showAutonomousMode is enabled", () => {
    expect(featureFlags.showAutonomousMode).toBe(true);
  });
});
