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
  status: "pending" | "success" | "error";
  error?: string;
  columns?: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AgentLog {
  agent: string;
  action: string;
  status: "running" | "done" | "error" | "pending";
  detail: string;
  time: string;
}

export interface SystemStatus {
  api: "unknown" | "ok" | "error";
  db: "unknown" | "ok" | "error";
  rag: "unknown" | "ok" | "error";
  version: string;
  uptime: string;
}

export type PanelId = "left" | "center" | "right";
export type LayoutPreset = "default" | "left-wide" | "right-wide" | "center-focus";
export type Language = "en" | "zh";
