import type React from "react";
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
  type MultiStepResult,
  type PlanStep,
  type MultiStepExecuted,
} from "@/services/api";
import { useInvestigationStore } from "@/stores/investigation-store";
import type { AnalysisSection, TraceSnapshot } from "@/stores/analysis-store";
import type { ChartSpec } from "@/types";
// ── Mode result type ──────────────────────────────────────────
export interface ModeResult {
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
export async function runExplainMode(
  sql: string, question: string, results: Record<string, unknown>[],
  history: { role: string; content: string }[],
  language: string, t: (k: string) => string,
  onStreaming: (c: string | null) => void,
  streamAbortRef: React.MutableRefObject<AbortController | null>,
  sessionStore: ReturnType<typeof useInvestigationStore.getState>,
): Promise<ModeResult> {
  let accumulated = "";
  let frameId: number | null = null;
  const scheduleUpdate = () => {
    if (frameId !== null) return;
    frameId = window.requestAnimationFrame(() => {
      frameId = null;
      onStreaming(accumulated);
    });
  };
  onStreaming("");
  await new Promise<void>((resolve, reject) => {
    const ctrl = streamAiExplain(question, sql, results, {
      onChunk: (text) => {
        accumulated += text;
        scheduleUpdate();
      },
      onDone: () => {
        if (frameId !== null) {
          window.cancelAnimationFrame(frameId);
          frameId = null;
        }
        onStreaming(accumulated);
        resolve();
      },
      onError: (err) => {
        if (frameId !== null) {
          window.cancelAnimationFrame(frameId);
          frameId = null;
        }
        reject(err);
      },
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
export async function runInsightsMode(
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
export async function runChartsMode(
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
export async function runAnomaliesMode(
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

export async function runFullAnalysisMode(
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
export async function runAutonomousMode(
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


