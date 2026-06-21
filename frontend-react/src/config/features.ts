/**
 * Feature Flags — controls visibility of experimental features.
 *
 * M4-2: Hide experimental AI features without deleting source code.
 * To restore any feature, set its flag to true.
 */

export const featureFlags = {
  /** Quick SQL panel in Analysis Workspace right sidebar */
  showQuickSqlPanel: false,

  /** Templates management (save/apply analysis templates) */
  showTemplates: false,

  /** Scheduled analysis tasks */
  showSchedule: false,

  /** Diff / Compare analysis runs */
  showDiffCompare: false,

  /** Timeline / Evolution view */
  showTimeline: false,

  /** Save-as-template action in run detail */
  showSaveAsTemplate: false,

  /** AI buttons in SQL Workspace (Explain, Insights, Charts, Anomalies) */
  showAiButtonsInSqlWorkspace: false,

  /** AI Generate SQL input in SQL Workspace */
  showAiSqlInputInWorkspace: false,

  /** Autonomous analysis mode (6-step) */
  showAutonomousMode: false,

  /** Charts analysis mode */
  showChartsMode: false,

  /** Anomalies analysis mode */
  showAnomaliesMode: false,

  /** Full-analysis mode (separate from autonomous) */
  showFullAnalysisMode: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

/**
 * Check if a feature flag is enabled.
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
