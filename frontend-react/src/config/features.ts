/**
 * Feature Flags — controls visibility of experimental features.
 *
 * Categories (M4-7.1):
 *   core        — product features, flag is temporary, will be removed once stable
 *   internal    — product decisions, intentionally hidden, not for external users
 *   experimental — not yet ready, may be promoted or deleted
 *   deprecated  — scheduled for removal, do not invest in these
 */

export const featureFlags = {
  // ── Core ────────────────────────────────────────────────────
  /** Autonomous analysis mode (6-step) — the primary AI analysis mode */
  showAutonomousMode: true,

  // ── Internal (product decisions, keep false) ────────────────
  /** AI buttons in SQL Workspace (Explain, Insights, Charts, Anomalies) — M4-6.0.1 product decision */
  showAiButtonsInSqlWorkspace: false,
  /** AI Generate SQL input in SQL Workspace — generates SQL into editor without auto-executing */
  showAiSqlInputInWorkspace: true,

  // ── Experimental (not yet ready) ────────────────────────────
  /** Charts analysis mode — not serving core workflow */
  showChartsMode: false,
  /** Anomalies analysis mode — not serving core workflow */
  showAnomaliesMode: false,
  /** Full-analysis mode (separate from autonomous) — not serving core workflow */
  showFullAnalysisMode: false,

  // ── Deprecated (scheduled for removal) ──────────────────────
  /** Quick SQL panel in Analysis Workspace right sidebar — superseded by SQL Workspace */
  showQuickSqlPanel: false,
  /** Templates management (save/apply analysis templates) — half-baked, no UI entry */
  showTemplates: false,
  /** Scheduled analysis tasks — half-baked, no UI entry */
  showSchedule: false,
  /** Diff / Compare analysis runs — half-baked, no UI entry */
  showDiffCompare: false,
  /** Timeline / Evolution view — half-baked, no UI entry */
  showTimeline: false,
  /** Save-as-template action in run detail — half-baked, no UI entry */
  showSaveAsTemplate: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

/**
 * Check if a feature flag is enabled.
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
