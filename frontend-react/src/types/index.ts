/** Core domain types for the AI Data Agent workspace. */

export interface TableColumn {
  name: string;
  dtype: string;
  nullable: boolean;
  uniqueCount: number;
}

export interface TableInfo {
  name: string;
  rowCount: number;
  columnCount: number;
  columns?: TableColumn[];
}

export interface QualityReport {
  overallScore: number;
  completenessScore: number;
  consistencyScore: number;
  validityScore: number;
  uniquenessScore: number;
  totalRows: number;
  totalColumns: number;
  nullCells: number;
  nullPct: number;
  duplicateRows: number;
  totalOutliers: number;
  warnings: string[];
  fieldHealth: FieldHealth[];
}

export interface FieldHealth {
  name: string;
  dtype: string;
  nullCount: number;
  nullPct: number;
  uniqueCount: number;
  outlierCount: number;
  outlierPct: number;
  score: number;
  warnings: string[];
}

export interface UploadedFile {
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  tableName?: string;
  rowCount: number;
  columnCount: number;
  status: "pending" | "running" | "success" | "error";
  error?: string;
  columns?: string[];
}

export interface SystemStatus {
  api: "unknown" | "ok" | "error";
  db: "unknown" | "ok" | "error";
  version: string;
  uptime: string;
}

export type PanelId = "left" | "center" | "right";
export type LayoutPreset = "default" | "left-wide" | "right-wide" | "center-focus";
export type Language = "en" | "zh";

export interface DatasetMeta {
  table: string;
  uploadTime: string | null;
  analysisCount: number;
  lastAnalyzedAt: string | null;
  qualityScore: number | null;
}

export interface AnomalyItem {
  column: string;
  row_index: number;
  value: number;
  expected_range: [number, number];
  deviation_score: number;
  method: "zscore" | "iqr";
}

export interface AnomalyInterpretation {
  column: string;
  anomaly_type: string;
  business_meaning: string;
  severity: "high" | "medium" | "low";
  suggested_investigation: string;
  confidence: number;
}

export interface ChartSpec {
  type: "bar" | "line" | "pie" | "scatter";
  title: string;
  xKey: string;
  yKey: string;
  data: Record<string, unknown>[];
}

export interface AnomalyResult {
  anomalies: AnomalyItem[];
  summary: {
    total_anomalies: number;
    columns_affected: string[];
    anomaly_rate_pct: number;
  };
  column_stats: Record<string, {
    mean: number;
    std: number;
    q25: number;
    q75: number;
    min: number;
    max: number;
    count: number;
  }>;
  interpretations: AnomalyInterpretation[];
  interpretation_summary: string;
  recommended_actions: string[];
  status: string;
  elapsed_ms?: number;
}
