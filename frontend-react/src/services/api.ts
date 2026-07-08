/**
 * Backward-compatible API barrel.
 *
 * New code should import feature modules from `@/services/api/*`.
 */

export { API_BASE, apiUrl, DIRECT_BACKEND, apiFetch } from "@/services/api/http-client";

export type {
  AiQualityGate,
  AiResultEnvelope,
  AiResultStatus,
  ApiEnvelopeStatus,
  ApiErrorInfo,
  ApiResponseEnvelope,
} from "@/services/api/envelope";
export {
  isApiResponseEnvelope,
  unwrapApiResponse,
} from "@/services/api/envelope";

export type { AIStatus, SystemStatusResponse } from "@/services/api/status";
export { fetchAIStatus, fetchStatus } from "@/services/api/status";

export type { PaginatedData } from "@/services/api/tables";
export {
  deleteTable,
  fetchTableData,
  fetchTableDataPaginated,
  fetchTableSchema,
  fetchTables,
  renameTable,
} from "@/services/api/tables";

export type {
  ExplainPlan,
  ExplainResult,
  QueryHistoryItem,
  QueryResult,
} from "@/services/api/query";
export {
  cancelQuery,
  executeQuery,
  explainQuery,
  exportQueryResult,
  fetchAllSchemas,
  fetchQueryHistory,
} from "@/services/api/query";

export type { SessionTableState, UploadTaskResponse, UploadTaskStage, UploadTaskStatus } from "@/services/api/data";
export {
  clearSessionState,
  fetchQualityReport,
  fetchSessionTableState,
  fetchUploadTaskStatus,
  startUploadTask,
  uploadFile,
  waitForUploadTask,
} from "@/services/api/data";

export type {
  AdaptedQuestion,
  AIQueryResult,
  AnalysisPlan,
  AnalysisProfile,
  AnalysisResult,
  ColumnSemantics,
  CompareResult,
  DatasetSemantics,
  EvaluationResult,
  FollowUpContext,
  InsightItem,
  LlmMetadata,
  LlmProvider,
  MultiStepExecuted,
  MultiStepResult,
  MultiStreamCallbacks,
  MultiStreamEvent,
  MultiStreamEventType,
  PlanStep,
  ReportOptions,
  SuggestedQuestion,
  TrendItem,
} from "@/services/api/ai";
export {
  aiAdaptTemplate,
  aiAnalyzeMulti,
  aiChartSuggest,
  aiDetectAnomalies,
  aiEvaluate,
  aiExplain,
  aiGeneratePlan,
  aiInsights,
  aiQuery,
  aiSemantics,
  aiSuggestQuestions,
  analyzeTable,
  compareRuns,
  createSchedule,
  deleteSchedule,
  exportBundle,
  generateReport,
  getScheduleResults,
  getTableProfile,
  importBundle,
  listSchedules,
  toggleSchedule,
} from "@/services/api/ai";

export type {
  AnomalyStreamCallbacks,
  GenericStreamCallbacks,
  StreamCallbacks,
} from "@/services/api/streams";
export {
  streamAiAnalyzeMulti,
  streamAiDetectAnomalies,
  streamAiExplain,
  streamAiInsights,
} from "@/services/api/streams";

export type {
  AgentBusinessReport,
  AgentProviderRequested,
  AgentProviderStatus,
  AgentRun,
  AgentLocale,
  AgentRunMode,
  AgentStep,
  AgentToolCall,
  BusinessReportViewModel,
  BusinessReportViewModelAction,
  BusinessReportViewModelNotice,
  BusinessReportItem,
  CreateAgentRunRequest,
  CreateAgentRunResponse,
} from "@/services/api/agent";
export { createAgentRun } from "@/services/api/agent";
