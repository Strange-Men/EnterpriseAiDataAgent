"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  aiInsights,
  aiChartSuggest,
  analyzeTable,
  streamAiExplain,
  aiSemantics,
  aiSuggestQuestions,
  streamAiAnalyzeMulti,
  getTableProfile,
  aiDetectAnomalies,
  aiEvaluate,
  type MultiStepResult,
  type PlanStep,
  type MultiStepExecuted,
  type EvaluationResult,
} from "@/services/api";
import { useInvestigationStore } from "@/stores/investigation-store";
import { useAnalysisStore, type AnalysisSection, type AnalysisMode, type TraceSnapshot } from "@/stores/analysis-store";
import { AiChart } from "@/components/ui/ai-chart";
import type { ChartSpec, AnomalyResult } from "@/types";
import { AnalysisHeader } from "@/components/ai/analysis-header";
import { AnalysisSectionView } from "@/components/ai/analysis-section";
import { StepResults } from "@/components/ai/step-results";
import { TraceTimeline } from "@/components/ai/trace-timeline";
import { FollowUpInput } from "@/components/ai/follow-up-input";

// Re-export for consumers
export type { AnalysisSection, AnalysisMode } from "@/stores/analysis-store";

// ── Loading skeleton ──────────────────────────────────────────
function AnalysisSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      <div className="h-4 bg-[var(--bg-tertiary)] rounded w-3/4" />
      <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/2" />
      <div className="h-4 bg-[var(--bg-tertiary)] rounded w-5/6" />
      <div className="h-20 bg-[var(--bg-tertiary)] rounded w-full" />
    </div>
  );
}

// ── Suggested questions ───────────────────────────────────────
function SuggestedQuestions({
  questions,
  onQuestionClick,
}: {
  questions: { question: string; reason: string }[];
  onQuestionClick?: (question: string) => void;
}) {
  const { t } = useTranslation();

  if (!questions.length) return null;

  return (
    <div className="mt-4 pt-3 border-t border-[var(--border-default)]">
      <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">
        {t("ai.suggested-questions")}
      </p>
      <div className="space-y-1.5">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => onQuestionClick?.(q.question)}
            className="w-full text-left px-3 py-2 rounded-md bg-[var(--bg-primary)] border border-[var(--border-default)] hover:border-[var(--accent)] transition-colors group"
          >
            <p className="text-xs text-[var(--text-primary)] group-hover:text-[var(--accent)]">{q.question}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{q.reason}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Mode result type ──────────────────────────────────────────
interface ModeResult {
  sections: AnalysisSection[];
  raw?: unknown;
  chartSpecs?: ChartSpec[];
  drillDownFindings?: { text: string; severity: string; index: number }[];
  followUpQuestion?: string;
  trace?: TraceSnapshot | null;
  suggestedQuestions?: { question: string; reason: string }[];
  storeMultiResult?: MultiStepResult | null;
}

// ── Mode: Explain ─────────────────────────────────────────────
async function runExplainMode(
  sql: string, question: string, results: Record<string, unknown>[],
  history: { role: string; content: string }[],
  language: string, t: (k: string) => string,
  onStreaming: (c: string | null) => void,
  streamAbortRef: React.MutableRefObject<AbortController | null>,
  sessionStore: ReturnType<typeof useInvestigationStore.getState>,
): Promise<ModeResult> {
  let accumulated = "";
  let lastUpdateTime = 0;
  onStreaming("");
  await new Promise<void>((resolve, reject) => {
    const ctrl = streamAiExplain(question, sql, results, {
      onChunk: (text) => {
        accumulated += text;
        const now = Date.now();
        if (now - lastUpdateTime > 100) { lastUpdateTime = now; onStreaming(accumulated); }
      },
      onDone: () => { onStreaming(accumulated); resolve(); },
      onError: (err) => reject(err),
    }, history.length > 0 ? history : undefined, language);
    streamAbortRef.current = ctrl;
  });
  const sections: AnalysisSection[] = [{
    title: t("ai.explanation"), content: accumulated || t("ai.no-explanation"), type: "markdown",
  }];
  sessionStore.addUserTurn(question);
  sessionStore.addAssistantTurn(accumulated, sql);
  onStreaming(null);
  const firstSentence = accumulated.split(/[.。!！]/)[0]?.trim();
  if (firstSentence && firstSentence.length > 10) sessionStore.addKeyFinding(firstSentence);

  const chartSpecs: ChartSpec[] = [];
  try {
    const chartRes = await aiChartSuggest(results, question, language);
    if (chartRes.recommended_charts?.length) {
      chartRes.recommended_charts
        .filter((c) => ["bar", "line", "pie", "scatter"].includes(c.type))
        .slice(0, 2)
        .forEach((c) => chartSpecs.push({
          type: c.type as ChartSpec["type"], title: c.title,
          xKey: c.x_axis, yKey: c.y_axis, data: results,
        }));
    }
  } catch { /* non-fatal */ }
  return { sections, chartSpecs };
}

// ── Mode: Insights ────────────────────────────────────────────
async function runInsightsMode(
  question: string, results: Record<string, unknown>[],
  language: string, t: (k: string) => string,
  priorContext: string | undefined,
): Promise<ModeResult> {
  const res = await aiInsights(question, results, language, priorContext);
  let md = "";
  const highSeverity: { text: string; severity: string; index: number }[] = [];
  if (res.insights?.length) {
    md += "### " + t("ai.key-insights") + "\n\n";
    res.insights.forEach((i, idx) => {
      if (typeof i === "string") { md += `- ${i}\n`; }
      else {
        const conf = i.confidence != null ? ` (${Math.round(i.confidence * 100)}%)` : "";
        const badge = i.severity === "high" ? " **[HIGH]**" : i.severity === "medium" ? " [MED]" : "";
        const lowConf = i.confidence != null && i.confidence < 0.4 ? ` *[${t("ai.low-confidence")}]*` : "";
        md += `- ${i.text}${conf}${badge}${lowConf}\n`;
        if (i.severity === "high" && i.text) highSeverity.push({ text: i.text, severity: i.severity, index: idx });
      }
    });
    if ((res.filtered_insights_count ?? 0) > 0) md += `\n*${res.filtered_insights_count} ${t("ai.insights-filtered")}*\n`;
  }
  if (res.trends?.length) {
    md += "\n### " + t("ai.trends") + "\n\n";
    res.trends.forEach((tr) => {
      md += typeof tr === "string" ? `- ${tr}\n` : `- ${tr.text}${tr.confidence != null ? ` (${Math.round(tr.confidence * 100)}%)` : ""}\n`;
    });
  }
  if (res.suggested_next_steps?.length) {
    md += "\n### " + t("ai.next-steps") + "\n\n";
    res.suggested_next_steps.forEach((s) => { md += `- [ ] ${s}\n`; });
  }
  return {
    sections: [{ title: t("ai.insights"), content: md || t("ai.no-insights"), type: "markdown" }],
    raw: res, drillDownFindings: highSeverity,
  };
}

// ── Mode: Charts ──────────────────────────────────────────────
async function runChartsMode(
  question: string, results: Record<string, unknown>[],
  language: string, t: (k: string) => string,
): Promise<ModeResult> {
  const res = await aiChartSuggest(results, question, language);
  let md = "";
  const chartSpecs: ChartSpec[] = [];
  if (res.recommended_charts?.length) {
    res.recommended_charts.forEach((c) => {
      md += `#### ${c.title}\n- **Type**: ${c.type}\n- **X-Axis**: ${c.x_axis}\n- **Y-Axis**: ${c.y_axis}\n- **Why**: ${c.reason}\n\n`;
    });
    res.recommended_charts
      .filter((c) => ["bar", "line", "pie", "scatter"].includes(c.type))
      .slice(0, 2)
      .forEach((c) => chartSpecs.push({
        type: c.type as ChartSpec["type"], title: c.title,
        xKey: c.x_axis, yKey: c.y_axis, data: results,
      }));
  }
  return {
    sections: [{ title: t("ai.chart-suggestions"), content: md || t("ai.no-charts"), type: "markdown" }],
    raw: res, chartSpecs,
  };
}

// ── Mode: Anomalies ───────────────────────────────────────────
async function runAnomaliesMode(
  question: string, results: Record<string, unknown>[],
  language: string, t: (k: string) => string,
): Promise<ModeResult> {
  const res = await aiDetectAnomalies(question, results, undefined, "auto", language);
  const anomalies = res?.anomalies ?? [];
  const summary = res?.summary ?? {};
  const interpretations = res?.interpretations ?? [];
  const recommendedActions = res?.recommended_actions ?? [];
  const sections: AnalysisSection[] = [];
  if (anomalies.length === 0) {
    sections.push({ title: t("ai.anomaly-detection"), content: t("ai.no-anomalies"), type: "markdown" });
  } else {
    let summaryMd = `**${summary.total_anomalies ?? 0}** ${t("ai.anomalies-found")} `;
    summaryMd += `(${summary.anomaly_rate_pct ?? 0}% ${t("ai.of-rows")})\n\n`;
    const affected = summary.columns_affected;
    const affectedStr = Array.isArray(affected) ? affected.join(", ") : String(affected ?? "");
    summaryMd += `**${t("ai.columns-affected")}:** ${affectedStr}\n`;
    sections.push({ title: t("ai.anomaly-summary"), content: summaryMd, type: "markdown" });

    let detailMd = `| ${t("ai.column")} | ${t("ai.value")} | ${t("ai.expected-range")} | ${t("ai.deviation")} | ${t("ai.method")} |\n|---|---|---|---|---|\n`;
    anomalies.slice(0, 20).forEach((a) => {
      const range = a.expected_range ?? [];
      detailMd += `| ${a.column} | ${a.value} | [${range[0] ?? ""}, ${range[1] ?? ""}] | ${a.deviation_score}x | ${a.method} |\n`;
    });
    sections.push({ title: t("ai.anomaly-details"), content: detailMd, type: "markdown" });

    if (interpretations.length > 0) {
      let interpMd = "";
      interpretations.forEach((interp) => {
        const sevBadge = interp.severity === "high" ? " **[HIGH]**" : interp.severity === "medium" ? " [MED]" : "";
        interpMd += `#### ${interp.column} — ${interp.anomaly_type}${sevBadge}\n`;
        interpMd += `${interp.business_meaning}\n\n`;
        interpMd += `*${t("ai.investigation")}: ${interp.suggested_investigation}*\n\n`;
      });
      sections.push({ title: t("ai.anomaly-interpretations"), content: interpMd, type: "markdown" });
    }

    if (recommendedActions.length > 0) {
      let actMd = "";
      recommendedActions.forEach((a) => { actMd += `- [ ] ${a}\n`; });
      sections.push({ title: t("ai.recommended-actions"), content: actMd, type: "markdown" });
    }
  }
  return { sections, raw: res };
}

// ── Mode: Full Analysis ───────────────────────────────────────
function buildProfileMd(profile: { row_count: number; column_count: number; null_pct: number; duplicate_rows: number; columns: { name: string; dtype: string; null_pct: number; unique_count: number; stats?: { mean: number; min: number; max: number }; top_values?: { value: string; count: number }[] }[] } | undefined, t: (k: string) => string): AnalysisSection[] {
  if (!profile) return [{ title: t("ai.data-profile"), content: "No profile data available.", type: "markdown" }];
  let md = `| ${t("ai.metric")} | ${t("ai.value")} |\n|---|---|\n`;
  md += `| ${t("ai.rows")} | ${profile.row_count.toLocaleString()} |\n`;
  md += `| ${t("ai.columns")} | ${profile.column_count} |\n`;
  md += `| ${t("ai.null-pct")} | ${profile.null_pct}% |\n`;
  md += `| ${t("ai.duplicates")} | ${profile.duplicate_rows.toLocaleString()} |\n`;
  const sections: AnalysisSection[] = [{ title: t("ai.data-profile"), content: md, type: "markdown" }];

  let colMd = `| ${t("ai.column")} | ${t("ai.type")} | ${t("ai.null-pct")} | ${t("ai.unique")} | ${t("ai.stats")} |\n|---|---|---|---|---|\n`;
  profile.columns.forEach((c) => {
    const stats = c.stats ? `mean=${c.stats.mean}, min=${c.stats.min}, max=${c.stats.max}`
      : c.top_values?.map((v) => `${v.value}(${v.count})`).join(", ") || "-";
    colMd += `| ${c.name} | ${c.dtype} | ${c.null_pct}% | ${c.unique_count} | ${stats} |\n`;
  });
  sections.push({ title: t("ai.column-details"), content: colMd, type: "markdown" });
  return sections;
}

function renderInsightsMd(insights: unknown[], _t: (k: string) => string): { md: string; highSeverity: { text: string; severity: string; index: number }[] } {
  let md = "";
  const highSeverity: { text: string; severity: string; index: number }[] = [];
  insights.forEach((i: unknown, idx: number) => {
    if (typeof i === "string") { md += `- ${i}\n`; }
    else if (typeof i === "object" && i !== null) {
      const item = i as { text?: string; confidence?: number; severity?: string };
      const conf = item.confidence != null ? ` (${Math.round(item.confidence * 100)}%)` : "";
      const badge = item.severity === "high" ? " **[HIGH]**" : item.severity === "medium" ? " [MED]" : "";
      md += `- ${item.text || ""}${conf}${badge}\n`;
      if (item.severity === "high" && item.text) highSeverity.push({ text: item.text, severity: item.severity, index: idx });
    }
  });
  return { md, highSeverity };
}

async function runFullAnalysisMode(
  tableName: string, language: string, t: (k: string) => string,
): Promise<ModeResult> {
  const res = await analyzeTable(tableName, language);
  if (!res?.profile) {
    return { sections: [{ title: t("ai.error"), content: "No profile data returned.", type: "markdown" }] };
  }
  const sections: AnalysisSection[] = buildProfileMd(res.profile, t);

  // Structured insights
  const insights = res.insights;
  if (Array.isArray(insights) && insights.length > 0) {
    const { md: insMd, highSeverity } = renderInsightsMd(insights, t);
    if (insMd) sections.push({ title: t("ai.key-insights"), content: insMd, type: "markdown" });
    if (highSeverity.length > 0) {
      useInvestigationStore.getState().addKeyFinding(highSeverity[0].text);
      // Store for drill-down will be handled by caller
    }
  } else if (res.ai_summary) {
    sections.push({ title: t("ai.summary"), content: res.ai_summary, type: "markdown" });
  }

  // Trends
  const trends = res.trends;
  if (Array.isArray(trends) && trends.length > 0) {
    let trendMd = "";
    trends.forEach((tr: unknown) => {
      if (typeof tr === "string") { trendMd += `- ${tr}\n`; }
      else if (typeof tr === "object" && tr !== null) {
        const item = tr as { text?: string; confidence?: number };
        trendMd += `- ${item.text || ""}${item.confidence != null ? ` (${Math.round(item.confidence * 100)}%)` : ""}\n`;
      }
    });
    if (trendMd) sections.push({ title: t("ai.trends"), content: trendMd, type: "markdown" });
  }

  if (Array.isArray(res.data_quality_notes) && res.data_quality_notes.length > 0) {
    let qMd = ""; res.data_quality_notes.forEach((n) => { qMd += `- ${n}\n`; });
    sections.push({ title: t("ai.data-quality"), content: qMd, type: "markdown" });
  }
  if (Array.isArray(res.suggested_next_steps) && res.suggested_next_steps.length > 0) {
    let nsMd = ""; res.suggested_next_steps.forEach((s) => { nsMd += `- [ ] ${s}\n`; });
    sections.push({ title: t("ai.next-steps"), content: nsMd, type: "markdown" });
  }

  // Semantic understanding (non-fatal)
  try {
    const semCols = res.profile.columns.map((c) => ({ name: c.name, dtype: c.dtype }));
    const sampleRows = res.data?.slice(0, 5) ?? [];
    const semRes = await aiSemantics(tableName, semCols, sampleRows, language);
    if (semRes.status === "success" && semRes.summary) {
      let semMd = `**${semRes.summary}**\n\n`;
      if (semRes.detected_kpis?.length) semMd += `**${t("ai.kpis")}:** ${semRes.detected_kpis.join(", ")}\n\n`;
      if (semRes.detected_measures?.length) semMd += `**${t("ai.measures")}:** ${semRes.detected_measures.join(", ")}\n\n`;
      if (semRes.detected_time_columns?.length) semMd += `**${t("ai.time-columns")}:** ${semRes.detected_time_columns.join(", ")}\n\n`;
      if (semRes.detected_entities?.length) semMd += `**${t("ai.entities")}:** ${semRes.detected_entities.join(", ")}\n\n`;
      if (semRes.detected_dimensions?.length) semMd += `**${t("ai.dimensions")}:** ${semRes.detected_dimensions.join(", ")}\n\n`;
      if (semRes.suggested_focus) semMd += `**${t("ai.suggested-focus")}:** ${semRes.suggested_focus}\n\n`;
      if (semRes.columns?.length) {
        semMd += `| ${t("ai.column")} | ${t("ai.semantic-role")} | ${t("ai.business-meaning")} |\n|---|---|---|\n`;
        semRes.columns.forEach((c) => {
          const badges = [c.is_kpi ? "KPI" : "", c.is_time_column ? "TIME" : "", c.is_entity_id ? "ID" : "", c.aggregation_hint ? c.aggregation_hint.toUpperCase() : ""]
            .filter(Boolean).map((b) => `\`${b}\``).join(" ");
          semMd += `| ${c.name} | ${c.semantic_role} ${badges} | ${c.business_meaning} |\n`;
        });
      }
      sections.push({ title: t("ai.semantic-understanding"), content: semMd, type: "markdown" });
    }
  } catch { /* non-fatal */ }

  // Chart suggestions
  if (res.chart_suggestions?.length) {
    let chartMd = "";
    res.chart_suggestions.forEach((c) => {
      chartMd += `#### ${c.title}\n- **${t("ai.chart-type")}**: ${c.type}\n- **X**: ${c.x_axis} | **Y**: ${c.y_axis}\n- ${c.reason}\n\n`;
    });
    sections.push({ title: t("ai.chart-suggestions"), content: chartMd, type: "markdown" });
  }

  // Suggested questions (non-fatal)
  let suggestedQuestions: { question: string; reason: string }[] = [];
  try {
    const sqRes = await aiSuggestQuestions(tableName, res.profile as unknown as Record<string, unknown>, undefined, language);
    if (sqRes.questions?.length) suggestedQuestions = sqRes.questions;
  } catch { /* non-fatal */ }

  const chartSpecs: ChartSpec[] = [];
  if (res.data?.length && res.chart_suggestions?.length) {
    res.chart_suggestions
      .filter((c) => ["bar", "line", "pie", "scatter"].includes(c.type))
      .slice(0, 2)
      .forEach((c) => chartSpecs.push({
        type: c.type as ChartSpec["type"], title: c.title,
        xKey: c.x_axis, yKey: c.y_axis, data: res.data!,
      }));
  }

  return { sections, raw: res, chartSpecs, suggestedQuestions };
}

// ── Mode: Autonomous ──────────────────────────────────────────
async function runAutonomousMode(
  tableName: string, question: string, language: string, t: (k: string) => string,
  priorFindings: string[] | undefined,
  setProgressInfo: React.Dispatch<React.SetStateAction<{
    totalSteps: number; currentStep: number; startTime: number;
    stepSummaries: { step: number; purpose: string; rowCount?: number; elapsedMs?: number; status: "success" | "error" }[];
  } | null>>,
  setSections: React.Dispatch<React.SetStateAction<AnalysisSection[]>>,
  setMultiResult: React.Dispatch<React.SetStateAction<MultiStepResult | null>>,
  setElapsedSeconds: React.Dispatch<React.SetStateAction<number>>,
  progressTimerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
  streamAbortRef: React.MutableRefObject<AbortController | null>,
): Promise<ModeResult> {
  const profileRes = await getTableProfile(tableName);
  if (!profileRes?.profile?.columns) {
    return { sections: [{ title: t("ai.error"), content: "No profile data returned.", type: "markdown" }] };
  }
  const cols = profileRes.profile.columns.map((c) => ({ name: c.name, dtype: c.dtype }));
  const q = question || t("ai.full-analysis");

  let planSteps: PlanStep[] = [];
  const executedSteps: MultiStepExecuted[] = [];
  let execSummary = "";
  let runTrace: TraceSnapshot | null = null;
  const startTime = Date.now();

  setElapsedSeconds(0);
  progressTimerRef.current = setInterval(() => {
    setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
  }, 1000);

  await new Promise<void>((resolve, reject) => {
    const ctrl = streamAiAnalyzeMulti(q, tableName, cols, [], {
      onPlan: (plan) => {
        planSteps = plan;
        setProgressInfo({ totalSteps: plan.length, currentStep: 0, startTime, stepSummaries: [] });
        let planMd = "";
        plan.forEach((p) => { planMd += `**${t("ai.step")} ${p.step}:** ${p.purpose}\n_${p.sql_goal}_\n\n`; });
        setSections([{ title: t("ai.analysis-plan"), content: planMd, type: "markdown" }]);
      },
      onStepStart: (stepNum, purpose) => {
        setProgressInfo((prev) => prev ? { ...prev, currentStep: stepNum } : null);
        setSections((prev) => [
          ...prev.filter((s) => s.title !== t("ai.running-steps")),
          { title: t("ai.running-steps"), content: `**${t("ai.step")} ${stepNum}/${planSteps.length}:** ${purpose}...`, type: "markdown" },
        ]);
      },
      onStepResult: (event) => {
        executedSteps.push({
          step: event.step!, purpose: event.purpose || "", sql: event.sql || "",
          columns: event.columns || [], data: event.data || [],
          row_count: event.row_count, error: event.error, status: event.status || "error",
        });
        setProgressInfo((prev) => {
          if (!prev) return null;
          return { ...prev, stepSummaries: [...prev.stepSummaries, {
            step: event.step!, purpose: event.purpose || "", rowCount: event.row_count,
            elapsedMs: Date.now() - startTime, status: (event.status || "error") as "success" | "error",
          }] };
        });
        setMultiResult({ question: q, plan: planSteps, steps: [...executedSteps], summary: execSummary, status: "success" });
      },
      onStepRetry: (stepNum, attempt) => {
        setSections((prev) => [
          ...prev.filter((s) => s.title !== t("ai.running-steps")),
          { title: t("ai.running-steps"), content: `**${t("ai.step")} ${stepNum}/${planSteps.length}:** ${t("ai.retry")} (${t("ai.attempt")} ${attempt})...`, type: "markdown" },
        ]);
      },
      onSummary: (summary) => {
        execSummary = summary;
        setSections((prev) => [
          ...prev.filter((s) => s.title !== t("ai.running-steps")),
          { title: t("ai.executive-summary"), content: summary, type: "markdown" },
        ]);
      },
      onError: (err) => reject(err),
      onDone: (data) => {
        if (progressTimerRef.current) { clearInterval(progressTimerRef.current); progressTimerRef.current = null; }
        setSections((prev) => prev.filter((s) => s.title !== t("ai.running-steps")));
        const rawTrace = data?.trace;
        if (rawTrace) {
          runTrace = {
            trace_id: String(rawTrace.trace_id || ""), total_llm_calls: Number(rawTrace.total_llm_calls || 0),
            total_input_tokens: Number(rawTrace.total_input_tokens || 0), total_output_tokens: Number(rawTrace.total_output_tokens || 0),
            events: (rawTrace.events ?? []) as TraceSnapshot["events"],
            guardrail_violations: (rawTrace.guardrail_violations ?? []) as string[],
          };
        }
        resolve();
      },
    }, language, 500, priorFindings);
    streamAbortRef.current = ctrl;
  });

  const finalResult: MultiStepResult = { question: q, plan: planSteps, steps: executedSteps, summary: execSummary, status: "success" };
  setMultiResult(finalResult);
  return { sections: [], raw: finalResult, trace: runTrace, storeMultiResult: finalResult };
}

// ── Props ─────────────────────────────────────────────────────
interface AIAnalysisPanelProps {
  tableName?: string;
  sql?: string;
  question?: string;
  results?: Record<string, unknown>[];
  mode: AnalysisMode;
  onClose?: () => void;
  onComplete?: (table: string) => void;
  onSqlGenerated?: (sql: string) => void;
}

// ── Main component ────────────────────────────────────────────
export function AIAnalysisPanel({
  tableName, sql, question, results, mode, onClose, onComplete, onSqlGenerated,
}: AIAnalysisPanelProps) {
  const { t, i18n } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<AnalysisSection[]>([]);
  const [rawData, setRawData] = useState<unknown>(null);
  const [hasRun, setHasRun] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const [streamingError, setStreamingError] = useState<string | null>(null);
  const [chartSpecs, setChartSpecs] = useState<ChartSpec[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<{ question: string; reason: string }[]>([]);
  const [multiResult, setMultiResult] = useState<MultiStepResult | null>(null);
  const [trace, setTrace] = useState<TraceSnapshot | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [drillDownFindings, setDrillDownFindings] = useState<{ text: string; severity: string; index: number }[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  // Progress tracking for autonomous analysis
  const [progressInfo, setProgressInfo] = useState<{
    totalSteps: number;
    currentStep: number;
    startTime: number;
    stepSummaries: { step: number; purpose: string; rowCount?: number; elapsedMs?: number; status: "success" | "error" }[];
  } | null>(null);

  const streamAbortRef = useRef<AbortController | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Abort streaming on unmount — read refs inside cleanup to capture current values
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentional: need latest ref value at cleanup, not captured null
      streamAbortRef.current?.abort();
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  // ── Run analysis (dispatcher) ──────────────────────────────
  const runAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setStreamingError(null);
    setSections([]);
    setRawData(null);
    setStreamingContent(null);
    setChartSpecs([]);
    setSuggestedQuestions([]);
    setMultiResult(null);
    setTrace(null);
    setFollowUpQuestion(null);
    setDrillDownFindings([]);
    setProgressInfo(null);
    setElapsedSeconds(0);

    const runId = useAnalysisStore.getState().addRun(mode, question || tableName || "", tableName);

    try {
      let result: ModeResult = { sections: [] };

      if (mode === "explain" && sql && question && results) {
        const sessionStore = useInvestigationStore.getState();
        const history = sessionStore.getRecentTurns(6).map((t) => ({ role: t.role, content: t.content }));
        result = await runExplainMode(sql, question, results, history, i18n.language, t,
          setStreamingContent, streamAbortRef, sessionStore);
      } else if (mode === "insights" && question && results) {
        const priorContext = useInvestigationStore.getState().getContextForInsights();
        result = await runInsightsMode(question, results, i18n.language, t, priorContext ?? undefined);
        if (result.drillDownFindings?.length) {
          setDrillDownFindings(result.drillDownFindings);
          if (!priorContext) useInvestigationStore.getState().addKeyFinding(result.drillDownFindings[0].text);
        }
      } else if (mode === "charts" && results) {
        result = await runChartsMode(question || "", results, i18n.language, t);
      } else if (mode === "anomalies" && question && results) {
        result = await runAnomaliesMode(question, results, i18n.language, t);
        if (result.raw) useAnalysisStore.getState().updateRun(runId, { anomalies: result.raw as AnomalyResult });
        const anomalyRes = result.raw as { anomalies: unknown[]; summary: { total_anomalies: number; columns_affected: string[] } };
        if (anomalyRes?.anomalies?.length > 0) {
          useInvestigationStore.getState().addKeyFinding(
            `${anomalyRes.summary.total_anomalies} anomalies detected in ${anomalyRes.summary.columns_affected.join(", ")}`
          );
        }
      } else if (mode === "full-analysis" && tableName) {
        result = await runFullAnalysisMode(tableName, i18n.language, t);
      } else if (mode === "autonomous" && tableName) {
        const priorFindings = useInvestigationStore.getState().getContextForPlan();
        result = await runAutonomousMode(tableName, question || "", i18n.language, t,
          priorFindings ?? undefined, setProgressInfo, setSections, setMultiResult,
          setElapsedSeconds, progressTimerRef, streamAbortRef);
      }

      if (result.chartSpecs?.length) setChartSpecs(result.chartSpecs);
      if (result.suggestedQuestions?.length) setSuggestedQuestions(result.suggestedQuestions);
      if (result.trace) setTrace(result.trace);
      if (result.followUpQuestion) setFollowUpQuestion(result.followUpQuestion);

      setSections(result.sections);
      setRawData(result.raw);
      setHasRun(true);

      useAnalysisStore.getState().updateRun(runId, {
        status: "success",
        sections: result.sections,
        multiResult: result.storeMultiResult ?? null,
        trace: result.trace ?? null,
      });

      // Auto-evaluate (non-fatal)
      if (result.sections.length > 0) {
        const evalSections = result.sections.filter((s) => s.content?.trim().length > 0)
          .map((s) => ({ title: s.title, content: s.content, type: s.type }));
        if (evalSections.length > 0) {
          const traceData = result.trace as TraceSnapshot | null;
          aiEvaluate(question || tableName || "", evalSections,
            traceData ? { total_llm_calls: traceData.total_llm_calls, total_output_tokens: traceData.total_output_tokens, guardrail_violations: traceData.guardrail_violations } : undefined,
            i18n.language,
          ).then((res) => {
            if (!mountedRef.current) return;
            setEvaluation(res);
            useAnalysisStore.getState().updateRun(runId, { evaluation: res });
          }).catch(() => { /* non-fatal */ });
        }
      }

      if (mode === "full-analysis" && tableName && onComplete) onComplete(tableName);
    } catch (err) {
      if (progressTimerRef.current) { clearInterval(progressTimerRef.current); progressTimerRef.current = null; }
      const errMsg = err instanceof Error ? err.message : t("ai.analysis-failed");
      if (streamingContent !== null && streamingContent.length > 0) {
        setStreamingError(errMsg);
        setStreamingContent(null);
      } else { setError(errMsg); }
      useAnalysisStore.getState().updateRun(runId, { status: "error", error: errMsg });
    } finally {
      setIsLoading(false);
    }
  }, [mode, sql, question, results, tableName, t, i18n.language, streamingContent, onComplete]);

  // ── Retry streaming (preserves partial content) ───────────
  const retryStreaming = useCallback(() => {
    setStreamingError(null);
    setStreamingContent(null);
    runAnalysis();
  }, [runAnalysis]);

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full border border-[var(--border-default)] rounded-lg overflow-hidden bg-[var(--bg-secondary)]">
      <AnalysisHeader
        mode={mode}
        tableName={tableName}
        hasResults={hasRun}
        sections={sections}
        rawData={rawData}
        isLoading={isLoading}
        onRun={!hasRun && !isLoading ? runAnalysis : undefined}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto p-3">
        {isLoading && <AnalysisSkeleton />}

        {error && (
          <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-md">
            <p className="text-xs font-medium text-red-400 mb-1">{t("ai.error")}</p>
            <p className="text-xs text-red-300">{error}</p>
            <button
              onClick={runAnalysis}
              className="mt-2 px-2 py-1 text-xs text-red-300 border border-red-500/30 rounded hover:bg-red-500/10 transition-colors"
            >
              {t("ai.retry")}
            </button>
          </div>
        )}

        {!hasRun && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="text-2xl mb-2 text-[var(--text-muted)]">
              <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-[var(--text-muted)]">{t("ai.ready")}</p>
            <button
              onClick={runAnalysis}
              className="mt-3 px-4 py-1.5 text-xs bg-[var(--accent)] text-[var(--bg-primary)] rounded-md hover:opacity-90 transition-opacity font-medium"
            >
              {t("ai.run")}
            </button>
          </div>
        )}

        {/* Progress indicator for autonomous analysis */}
        {progressInfo && progressInfo.totalSteps > 0 && (
          <div className="mb-4 p-3 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--accent)]">
                  {t("ai.progress")}: {progressInfo.currentStep}/{progressInfo.totalSteps}
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              </div>
              <span className="text-xs text-[var(--text-muted)]">
                {elapsedSeconds >= 60
                  ? `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s`
                  : `${elapsedSeconds}s`}
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
                style={{ width: `${Math.round((progressInfo.currentStep / progressInfo.totalSteps) * 100)}%` }}
              />
            </div>
            {/* Step summaries */}
            {progressInfo.stepSummaries.length > 0 && (
              <div className="space-y-1 mt-2">
                {progressInfo.stepSummaries.map((s) => (
                  <div key={s.step} className="flex items-center gap-2 text-[10px]">
                    <span className={s.status === "success" ? "text-emerald-400" : "text-red-400"}>
                      {s.status === "success" ? "✓" : "✗"}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {t("ai.step")} {s.step}: {s.purpose}
                    </span>
                    {s.rowCount != null && (
                      <span className="text-[var(--text-muted)]">({s.rowCount} rows)</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Streaming content */}
        {streamingContent !== null && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
                {t("ai.explanation")}
              </h3>
              <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            </div>
            <div className="ai-markdown-content">
              <AnalysisSectionView section={{ title: "", content: streamingContent, type: "markdown" }} />
            </div>
          </div>
        )}

        {/* Streaming error with retry (preserves partial content) */}
        {streamingError && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-md">
            <p className="text-xs font-medium text-amber-400 mb-1">{t("ai.connection-lost")}</p>
            <p className="text-xs text-amber-300 mb-2">{streamingError}</p>
            <button
              onClick={retryStreaming}
              className="px-3 py-1.5 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded hover:bg-amber-500/30 transition-colors"
            >
              {t("ai.retry")}
            </button>
          </div>
        )}

        {/* Sections */}
        {sections.map((section, i) => (
          <AnalysisSectionView key={i} section={section} />
        ))}

        {/* Charts */}
        {chartSpecs.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[var(--border-default)] space-y-4">
            {chartSpecs.map((spec, i) => (
              <AiChart key={i} spec={spec} />
            ))}
          </div>
        )}

        {/* Multi-step results */}
        {multiResult && multiResult.steps?.length > 0 && (
          <StepResults steps={multiResult.steps} />
        )}

        {/* Trace */}
        {trace && <TraceTimeline trace={trace} />}

        {/* Suggested questions */}
        {suggestedQuestions.length > 0 && (
          <SuggestedQuestions questions={suggestedQuestions} onQuestionClick={setFollowUpQuestion} />
        )}

        {/* Drill-down on high-severity findings */}
        {drillDownFindings.length > 0 && hasRun && !isLoading && (
          <div className="mt-4 pt-3 border-t border-[var(--border-default)]">
            <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">
              {t("ai.drill-down")}
            </p>
            <div className="space-y-1.5">
              {drillDownFindings.map((finding, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const runId = useAnalysisStore.getState().activeRunId;
                    if (!runId) return;
                    const newId = useAnalysisStore.getState().drillDownRun(runId, finding.index, finding.text);
                    if (newId) {
                      useInvestigationStore.getState().addKeyFinding(finding.text);
                      setFollowUpQuestion(finding.text);
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded-md bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-colors group"
                >
                  <p className="text-xs text-[var(--text-primary)] group-hover:text-amber-400">
                    <span className="text-amber-400 font-semibold">[HIGH]</span> {finding.text}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{t("ai.drill-down-hint")}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quality Assessment */}
        {evaluation && hasRun && !isLoading && (
          <div className="mt-4 pt-3 border-t border-[var(--border-default)]">
            <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">
              {t("ai.quality-assessment")}
            </p>
            {/* Confidence bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[var(--text-secondary)]">{t("ai.confidence-score")}</span>
                <span className={`text-xs font-medium ${evaluation.confidence >= 0.7 ? "text-emerald-400" : evaluation.confidence >= 0.4 ? "text-amber-400" : "text-red-400"}`}>
                  {Math.round(evaluation.confidence * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${evaluation.confidence >= 0.7 ? "bg-emerald-500" : evaluation.confidence >= 0.4 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${Math.round(evaluation.confidence * 100)}%` }}
                />
              </div>
            </div>
            {/* Dimension badges */}
            <div className="flex gap-2 mb-2">
              {(["completeness", "accuracy", "actionability"] as const).map((dim) => {
                const val = evaluation[dim];
                const color = val === "high" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : val === "medium" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : val === "low" ? "bg-red-500/15 text-red-400 border-red-500/30" : "bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-[var(--border-default)]";
                return (
                  <span key={dim} className={`text-[10px] px-2 py-0.5 rounded-full border ${color}`}>
                    {t(`ai.${dim}`)}: {val}
                  </span>
                );
              })}
            </div>
            {/* Quality gate warnings */}
            {evaluation.quality_gates && !evaluation.quality_gates.passed && (
              <div className="mb-2 px-2 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
                {evaluation.quality_gates.warnings.map((w, i) => (
                  <p key={i} className="text-[10px] text-amber-300">⚠ {w}</p>
                ))}
              </div>
            )}
            {/* Diagnostics */}
            {evaluation.diagnostics.length > 0 && (
              <div className="mb-1">
                <p className="text-[10px] font-medium text-[var(--text-muted)] mb-0.5">{t("ai.diagnostics")}</p>
                {evaluation.diagnostics.map((d, i) => (
                  <p key={i} className="text-[10px] text-[var(--text-secondary)]">- {d}</p>
                ))}
              </div>
            )}
            {/* Suggested improvements */}
            {evaluation.suggested_improvements.length > 0 && (
              <div>
                <p className="text-[10px] font-medium text-[var(--text-muted)] mb-0.5">{t("ai.improvements")}</p>
                {evaluation.suggested_improvements.map((imp, i) => (
                  <p key={i} className="text-[10px] text-[var(--text-secondary)]">- {imp}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Follow-up */}
        {hasRun && !isLoading && (
          <FollowUpInput results={results} onSqlGenerated={onSqlGenerated} question={followUpQuestion ?? undefined} onQuestionChange={setFollowUpQuestion} />
        )}
      </div>
    </div>
  );
}
