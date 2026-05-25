"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
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
  type FollowUpContext,
  type MultiStepResult,
  type PlanStep,
  type MultiStepExecuted,
} from "@/services/api";
import { useAiSessionStore } from "@/stores/ai-session-store";
import { useAnalysisStore, type AnalysisSection, type TraceSnapshot } from "@/stores/analysis-store";
import { AiChart, type ChartSpec } from "@/components/ui/ai-chart";
import { AnalysisHeader } from "@/components/ai/analysis-header";
import { AnalysisSectionView } from "@/components/ai/analysis-section";
import { StepResults } from "@/components/ai/step-results";
import { TraceTimeline } from "@/components/ai/trace-timeline";
import { FollowUpInput } from "@/components/ai/follow-up-input";

// Re-export for consumers
export type { AnalysisSection } from "@/stores/analysis-store";
export type AnalysisMode = "explain" | "insights" | "charts" | "full-analysis" | "autonomous" | "anomalies";

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
  const [chartSpecs, setChartSpecs] = useState<ChartSpec[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<{ question: string; reason: string }[]>([]);
  const [multiResult, setMultiResult] = useState<MultiStepResult | null>(null);
  const [trace, setTrace] = useState<TraceSnapshot | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [drillDownFindings, setDrillDownFindings] = useState<{ text: string; severity: string; index: number }[]>([]);

  const streamAbortRef = useRef<AbortController | null>(null);

  // Abort streaming on unmount
  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort();
    };
  }, []);

  // ── Run analysis ──────────────────────────────────────────
  const runAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSections([]);
    setRawData(null);
    setStreamingContent(null);
    setChartSpecs([]);
    setSuggestedQuestions([]);
    setMultiResult(null);
    setTrace(null);
    setFollowUpQuestion(null);
    setDrillDownFindings([]);

    // Record in analysis store
    const runId = useAnalysisStore.getState().addRun(mode, question || tableName || "", tableName);

    try {
      const builtSections: AnalysisSection[] = [];
      let raw: unknown = null;
      let runTrace: TraceSnapshot | null = null;
      let storeMultiResult: MultiStepResult | null = null;

      if (mode === "explain" && sql && question && results) {
        const sessionStore = useAiSessionStore.getState();
        const history = sessionStore.getRecentTurns(6).map((t) => ({
          role: t.role,
          content: t.content,
        }));

        let accumulated = "";
        setStreamingContent("");
        await new Promise<void>((resolve, reject) => {
          const ctrl = streamAiExplain(question, sql, results, {
            onChunk: (text) => {
              accumulated += text;
              setStreamingContent(accumulated);
            },
            onDone: () => resolve(),
            onError: (err) => reject(err),
          }, history.length > 0 ? history : undefined, i18n.language);
          streamAbortRef.current = ctrl;
        });
        builtSections.push({
          title: t("ai.explanation"),
          content: accumulated || t("ai.no-explanation"),
          type: "markdown",
        });
        sessionStore.addUserTurn(question);
        sessionStore.addAssistantTurn(accumulated, sql);
        setStreamingContent(null);

        // Auto-populate key findings from explanation
        const firstSentence = accumulated.split(/[.。!！]/)[0]?.trim();
        if (firstSentence && firstSentence.length > 10) {
          sessionStore.addKeyFinding(firstSentence);
        }

        let explainChartSpecs: ChartSpec[] = [];
        if (results && results.length > 0) {
          try {
            const chartRes = await aiChartSuggest(results, question, i18n.language);
            if (chartRes.recommended_charts?.length) {
              explainChartSpecs = chartRes.recommended_charts
                .filter((c) => ["bar", "line", "pie", "scatter"].includes(c.type))
                .slice(0, 2)
                .map((c) => ({
                  type: c.type as ChartSpec["type"],
                  title: c.title,
                  xKey: c.x_axis,
                  yKey: c.y_axis,
                  data: results,
                }));
              setChartSpecs(explainChartSpecs);
            }
          } catch { /* non-fatal */ }
        }

        setHasRun(true);
        setIsLoading(false);
        useAnalysisStore.getState().updateRun(runId, {
          status: "success",
          sections: builtSections,
          chartSpecs: explainChartSpecs,
        });
        return;
      } else if (mode === "insights" && question && results) {
        // Pass prior context from session store
        const priorContext = useAiSessionStore.getState().getContextForInsights();
        const res = await aiInsights(question, results, i18n.language, priorContext ?? undefined);
        raw = res;
        let md = "";
        const highSeverityInsights: { text: string; severity: string; index: number }[] = [];
        if (res.insights?.length) {
          md += "### " + t("ai.key-insights") + "\n\n";
          res.insights.forEach((i, idx) => {
            if (typeof i === "string") {
              md += `- ${i}\n`;
            } else {
              const conf = i.confidence != null ? ` (${Math.round(i.confidence * 100)}%)` : "";
              const badge = i.severity === "high" ? " **[HIGH]**" : i.severity === "medium" ? " [MED]" : "";
              md += `- ${i.text}${conf}${badge}\n`;
              if (i.severity === "high" && i.text) {
                highSeverityInsights.push({ text: i.text, severity: i.severity, index: idx });
              }
            }
          });
        }
        // Auto-populate key findings from high-severity insights
        if (highSeverityInsights.length > 0) {
          setDrillDownFindings(highSeverityInsights);
          const sessionStore = useAiSessionStore.getState();
          if (!priorContext) {
            sessionStore.addKeyFinding(highSeverityInsights[0].text);
          }
        }
        if (res.trends?.length) {
          md += "\n### " + t("ai.trends") + "\n\n";
          res.trends.forEach((t) => {
            if (typeof t === "string") {
              md += `- ${t}\n`;
            } else {
              const conf = t.confidence != null ? ` (${Math.round(t.confidence * 100)}%)` : "";
              md += `- ${t.text}${conf}\n`;
            }
          });
        }
        if (res.suggested_next_steps?.length) {
          md += "\n### " + t("ai.next-steps") + "\n\n";
          res.suggested_next_steps.forEach((s) => { md += `- [ ] ${s}\n`; });
        }
        builtSections.push({
          title: t("ai.insights"),
          content: md || t("ai.no-insights"),
          type: "markdown",
        });
      } else if (mode === "charts" && results) {
        const res = await aiChartSuggest(results, question || "", i18n.language);
        raw = res;
        let md = "";
        if (res.recommended_charts?.length) {
          res.recommended_charts.forEach((c) => {
            md += `#### ${c.title}\n`;
            md += `- **Type**: ${c.type}\n`;
            md += `- **X-Axis**: ${c.x_axis}\n`;
            md += `- **Y-Axis**: ${c.y_axis}\n`;
            md += `- **Why**: ${c.reason}\n\n`;
          });
          // Render actual chart components
          const chartSpecsFromSuggest = res.recommended_charts
            .filter((c) => ["bar", "line", "pie", "scatter"].includes(c.type))
            .slice(0, 2)
            .map((c) => ({
              type: c.type as ChartSpec["type"],
              title: c.title,
              xKey: c.x_axis,
              yKey: c.y_axis,
              data: results,
            }));
          if (chartSpecsFromSuggest.length) setChartSpecs(chartSpecsFromSuggest);
        }
        builtSections.push({
          title: t("ai.chart-suggestions"),
          content: md || t("ai.no-charts"),
          type: "markdown",
        });
      } else if (mode === "anomalies" && question && results) {
        // Anomaly detection mode
        const res = await aiDetectAnomalies(question, results, undefined, "auto", i18n.language);
        raw = res;

        if (res.anomalies.length === 0) {
          builtSections.push({
            title: t("ai.anomaly-detection"),
            content: t("ai.no-anomalies"),
            type: "markdown",
          });
        } else {
          // Summary section
          let summaryMd = `**${res.summary.total_anomalies}** ${t("ai.anomalies-found")} `;
          summaryMd += `(${res.summary.anomaly_rate_pct}% ${t("ai.of-rows")})\n\n`;
          summaryMd += `**${t("ai.columns-affected")}:** ${res.summary.columns_affected.join(", ")}\n`;
          builtSections.push({
            title: t("ai.anomaly-summary"),
            content: summaryMd,
            type: "markdown",
          });

          // Anomaly details
          let detailMd = `| ${t("ai.column")} | ${t("ai.value")} | ${t("ai.expected-range")} | ${t("ai.deviation")} | ${t("ai.method")} |\n|---|---|---|---|---|\n`;
          res.anomalies.slice(0, 20).forEach((a) => {
            detailMd += `| ${a.column} | ${a.value} | [${a.expected_range[0]}, ${a.expected_range[1]}] | ${a.deviation_score}x | ${a.method} |\n`;
          });
          builtSections.push({
            title: t("ai.anomaly-details"),
            content: detailMd,
            type: "markdown",
          });

          // LLM interpretations
          if (res.interpretations.length > 0) {
            let interpMd = "";
            res.interpretations.forEach((interp) => {
              const sevBadge = interp.severity === "high" ? " **[HIGH]**" : interp.severity === "medium" ? " [MED]" : "";
              interpMd += `#### ${interp.column} — ${interp.anomaly_type}${sevBadge}\n`;
              interpMd += `${interp.business_meaning}\n\n`;
              interpMd += `*${t("ai.investigation")}: ${interp.suggested_investigation}*\n\n`;
            });
            builtSections.push({
              title: t("ai.anomaly-interpretations"),
              content: interpMd,
              type: "markdown",
            });
          }

          // Recommended actions
          if (res.recommended_actions.length > 0) {
            let actMd = "";
            res.recommended_actions.forEach((a) => { actMd += `- [ ] ${a}\n`; });
            builtSections.push({
              title: t("ai.recommended-actions"),
              content: actMd,
              type: "markdown",
            });
          }
        }

        // Store anomalies on the run
        useAnalysisStore.getState().updateRun(runId, { anomalies: res });

        // Auto-populate key findings from anomalies
        if (res.anomalies.length > 0) {
          useAiSessionStore.getState().addKeyFinding(
            `${res.summary.total_anomalies} anomalies detected in ${res.summary.columns_affected.join(", ")}`
          );
        }
      } else if (mode === "full-analysis" && tableName) {
        const res = await analyzeTable(tableName, i18n.language);
        raw = res;

        const profile = res.profile;
        let profileMd = `| ${t("ai.metric")} | ${t("ai.value")} |\n|---|---|\n`;
        profileMd += `| ${t("ai.rows")} | ${profile.row_count.toLocaleString()} |\n`;
        profileMd += `| ${t("ai.columns")} | ${profile.column_count} |\n`;
        profileMd += `| ${t("ai.null-pct")} | ${profile.null_pct}% |\n`;
        profileMd += `| ${t("ai.duplicates")} | ${profile.duplicate_rows.toLocaleString()} |\n`;
        builtSections.push({ title: t("ai.data-profile"), content: profileMd, type: "markdown" });

        let colMd = `| ${t("ai.column")} | ${t("ai.type")} | ${t("ai.null-pct")} | ${t("ai.unique")} | ${t("ai.stats")} |\n|---|---|---|---|---|\n`;
        profile.columns.forEach((c) => {
          const stats = c.stats
            ? `mean=${c.stats.mean}, min=${c.stats.min}, max=${c.stats.max}`
            : c.top_values?.map((v) => `${v.value}(${v.count})`).join(", ") || "-";
          colMd += `| ${c.name} | ${c.dtype} | ${c.null_pct}% | ${c.unique_count} | ${stats} |\n`;
        });
        builtSections.push({ title: t("ai.column-details"), content: colMd, type: "markdown" });

        // Structured insights (replaces old plain-text ai_summary)
        const insights = res.insights;
        const trends = res.trends;
        const qualityNotes = res.data_quality_notes;
        const nextSteps = res.suggested_next_steps;

        if (Array.isArray(insights) && insights.length > 0) {
          let insMd = "";
          const highSeverity: { text: string; severity: string; index: number }[] = [];
          insights.forEach((i: unknown, idx: number) => {
            if (typeof i === "string") {
              insMd += `- ${i}\n`;
            } else if (typeof i === "object" && i !== null) {
              const item = i as { text?: string; confidence?: number; severity?: string };
              const conf = item.confidence != null ? ` (${Math.round(item.confidence * 100)}%)` : "";
              const badge = item.severity === "high" ? " **[HIGH]**" : item.severity === "medium" ? " [MED]" : "";
              insMd += `- ${item.text || ""}${conf}${badge}\n`;
              if (item.severity === "high" && item.text) {
                highSeverity.push({ text: item.text, severity: item.severity, index: idx });
              }
            }
          });
          if (insMd) builtSections.push({ title: t("ai.key-insights"), content: insMd, type: "markdown" });
          if (highSeverity.length > 0) {
            setDrillDownFindings(highSeverity);
            useAiSessionStore.getState().addKeyFinding(highSeverity[0].text);
          }
        } else if (res.ai_summary) {
          builtSections.push({ title: t("ai.summary"), content: res.ai_summary, type: "markdown" });
        }

        if (Array.isArray(trends) && trends.length > 0) {
          let trendMd = "";
          trends.forEach((tr: unknown) => {
            if (typeof tr === "string") {
              trendMd += `- ${tr}\n`;
            } else if (typeof tr === "object" && tr !== null) {
              const item = tr as { text?: string; confidence?: number };
              const conf = item.confidence != null ? ` (${Math.round(item.confidence * 100)}%)` : "";
              trendMd += `- ${item.text || ""}${conf}\n`;
            }
          });
          if (trendMd) builtSections.push({ title: t("ai.trends"), content: trendMd, type: "markdown" });
        }

        if (Array.isArray(qualityNotes) && qualityNotes.length > 0) {
          let qMd = "";
          qualityNotes.forEach((n) => { qMd += `- ${n}\n`; });
          builtSections.push({ title: t("ai.data-quality"), content: qMd, type: "markdown" });
        }

        if (Array.isArray(nextSteps) && nextSteps.length > 0) {
          let nsMd = "";
          nextSteps.forEach((s) => { nsMd += `- [ ] ${s}\n`; });
          builtSections.push({ title: t("ai.next-steps"), content: nsMd, type: "markdown" });
        }

        try {
          const semCols = profile.columns.map((c) => ({ name: c.name, dtype: c.dtype }));
          const sampleRows = res.data?.slice(0, 5) ?? [];
          const semRes = await aiSemantics(tableName, semCols, sampleRows, i18n.language);
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
                const badges = [
                  c.is_kpi ? "KPI" : "",
                  c.is_time_column ? "TIME" : "",
                  c.is_entity_id ? "ID" : "",
                  c.aggregation_hint ? c.aggregation_hint.toUpperCase() : "",
                ].filter(Boolean).map((b) => `\`${b}\``).join(" ");
                semMd += `| ${c.name} | ${c.semantic_role} ${badges} | ${c.business_meaning} |\n`;
              });
            }
            builtSections.push({ title: t("ai.semantic-understanding"), content: semMd, type: "markdown" });
          }
        } catch { /* non-fatal */ }

        if (res.chart_suggestions?.length) {
          let chartMd = "";
          res.chart_suggestions.forEach((c) => {
            chartMd += `#### ${c.title}\n- **${t("ai.chart-type")}**: ${c.type}\n- **X**: ${c.x_axis} | **Y**: ${c.y_axis}\n- ${c.reason}\n\n`;
          });
          builtSections.push({ title: t("ai.chart-suggestions"), content: chartMd, type: "markdown" });

          // Render actual chart components if data is available
          if (res.data?.length) {
            const fullAnalysisChartSpecs = res.chart_suggestions
              .filter((c) => ["bar", "line", "pie", "scatter"].includes(c.type))
              .slice(0, 2)
              .map((c) => ({
                type: c.type as ChartSpec["type"],
                title: c.title,
                xKey: c.x_axis,
                yKey: c.y_axis,
                data: res.data!,
              }));
            if (fullAnalysisChartSpecs.length) setChartSpecs(fullAnalysisChartSpecs);
          }
        }

        try {
          const sqRes = await aiSuggestQuestions(tableName, res.profile as unknown as Record<string, unknown>, undefined, i18n.language);
          if (sqRes.questions?.length) setSuggestedQuestions(sqRes.questions);
        } catch { /* non-fatal */ }
      } else if (mode === "autonomous" && tableName) {
        const profileRes = await getTableProfile(tableName);
        const cols = profileRes.profile.columns.map((c) => ({ name: c.name, dtype: c.dtype }));
        const q = question || t("ai.full-analysis");
        const priorFindings = useAiSessionStore.getState().getContextForPlan();

        let planSteps: PlanStep[] = [];
        const executedSteps: MultiStepExecuted[] = [];
        let execSummary = "";

        await new Promise<void>((resolve, reject) => {
          const ctrl = streamAiAnalyzeMulti(q, tableName, cols, [], {
            onPlan: (plan) => {
              planSteps = plan;
              let planMd = "";
              plan.forEach((p) => {
                planMd += `**${t("ai.step")} ${p.step}:** ${p.purpose}\n`;
                planMd += `_${p.sql_goal}_\n\n`;
              });
              setSections([{ title: t("ai.analysis-plan"), content: planMd, type: "markdown" }]);
            },
            onStepStart: (stepNum, purpose) => {
              setSections((prev) => [
                ...prev.filter((s) => s.title !== t("ai.running-steps")),
                {
                  title: t("ai.running-steps"),
                  content: `**${t("ai.step")} ${stepNum}:** ${purpose}...`,
                  type: "markdown",
                },
              ]);
            },
            onStepResult: (event) => {
              executedSteps.push({
                step: event.step!,
                purpose: event.purpose || "",
                sql: event.sql || "",
                columns: event.columns || [],
                data: event.data || [],
                row_count: event.row_count,
                error: event.error,
                status: event.status || "error",
              });
              setMultiResult({
                question: q,
                plan: planSteps,
                steps: [...executedSteps],
                summary: execSummary,
                status: "success",
              });
              // Don't remove running indicator here; onStepStart will update it
            },
            onStepRetry: (stepNum, attempt) => {
              setSections((prev) => [
                ...prev.filter((s) => s.title !== t("ai.running-steps")),
                {
                  title: t("ai.running-steps"),
                  content: `Step ${stepNum}: Retrying (attempt ${attempt})...`,
                  type: "markdown",
                },
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
              // Clean up running indicator
              setSections((prev) => prev.filter((s) => s.title !== t("ai.running-steps")));
              // Extract trace from done event
              const rawTrace = data?.trace;
              if (rawTrace) {
                runTrace = {
                  trace_id: String(rawTrace.trace_id || ""),
                  total_llm_calls: Number(rawTrace.total_llm_calls || 0),
                  total_input_tokens: Number(rawTrace.total_input_tokens || 0),
                  total_output_tokens: Number(rawTrace.total_output_tokens || 0),
                  events: (rawTrace.events ?? []) as TraceSnapshot["events"],
                  guardrail_violations: (rawTrace.guardrail_violations ?? []) as string[],
                };
              }
              resolve();
            },
          }, i18n.language, 500, priorFindings ?? undefined);
          streamAbortRef.current = ctrl;
        });

        const finalResult: MultiStepResult = {
          question: q,
          plan: planSteps,
          steps: executedSteps,
          summary: execSummary,
          status: "success",
        };
        setMultiResult(finalResult);
        raw = finalResult;
        storeMultiResult = finalResult;
        if (runTrace) setTrace(runTrace);
      }

      setSections(builtSections);
      setRawData(raw);
      setHasRun(true);

      // Update analysis store (use local vars, not closure — React state is async)
      useAnalysisStore.getState().updateRun(runId, {
        status: "success",
        sections: builtSections,
        multiResult: storeMultiResult,
        trace: runTrace,
      });

      if (mode === "full-analysis" && tableName && onComplete) {
        onComplete(tableName);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : t("ai.analysis-failed");
      setError(errMsg);
      useAnalysisStore.getState().updateRun(runId, { status: "error", error: errMsg });
    } finally {
      setIsLoading(false);
    }
  }, [mode, sql, question, results, tableName, t, i18n.language]);

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
                      useAiSessionStore.getState().addKeyFinding(finding.text);
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

        {/* Follow-up */}
        {hasRun && !isLoading && (
          <FollowUpInput results={results} onSqlGenerated={onSqlGenerated} question={followUpQuestion ?? undefined} onQuestionChange={setFollowUpQuestion} />
        )}
      </div>
    </div>
  );
}
