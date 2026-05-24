"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import toast from "react-hot-toast";
import {
  aiExplain,
  aiInsights,
  aiChartSuggest,
  analyzeTable,
  streamAiExplain,
  aiQuery,
  aiSemantics,
  aiSuggestQuestions,
  type AnalysisResult,
  type AIQueryResult,
  type FollowUpContext,
  type DatasetSemantics,
  type SuggestedQuestion,
} from "@/services/api";
import { downloadBlob } from "@/utils/download";
import { useAiSessionStore } from "@/stores/ai-session-store";
import { AiChart, type ChartSpec } from "@/components/ui/ai-chart";

// ── Theme-aware syntax highlighter style ──────────────────────
const lightTheme: Record<string, React.CSSProperties> = {
  'pre[class*="language-"]': { background: "#f6f8fa", color: "#24292f", padding: "12px", borderRadius: "6px", overflow: "auto", fontSize: "13px" },
  'code[class*="language-"]': { background: "none", color: "#24292f", fontSize: "13px" },
  comment: { color: "#6a737d" }, keyword: { color: "#cf222e" }, string: { color: "#0a3069" },
  function: { color: "#8250df" }, number: { color: "#0550ae" }, operator: { color: "#cf222e" },
  punctuation: { color: "#24292f" }, builtin: { color: "#0550ae" }, property: { color: "#953800" },
};

const darkTheme: Record<string, React.CSSProperties> = {
  'pre[class*="language-"]': { background: "#161b22", color: "#e6edf3", padding: "12px", borderRadius: "6px", overflow: "auto", fontSize: "13px" },
  'code[class*="language-"]': { background: "none", color: "#e6edf3", fontSize: "13px" },
  comment: { color: "#8b949e" }, keyword: { color: "#ff7b72" }, string: { color: "#a5d6ff" },
  function: { color: "#d2a8ff" }, number: { color: "#79c0ff" }, operator: { color: "#ff7b72" },
  punctuation: { color: "#e6edf3" }, builtin: { color: "#79c0ff" }, property: { color: "#ffa657" },
};

function useCodeTheme() {
  const isDark = typeof document !== "undefined" &&
    getComputedStyle(document.documentElement).getPropertyValue("--bg-primary").trim().startsWith("#");
  return isDark ? darkTheme : lightTheme;
}

// ── Copy icon ─────────────────────────────────────────────────
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

// ── Export icon ────────────────────────────────────────────────
function ExportIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

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

// ── Types ─────────────────────────────────────────────────────
export type AnalysisMode = "explain" | "insights" | "charts" | "full-analysis";

interface AnalysisSection {
  title: string;
  content: string;
  type: "markdown" | "sql" | "json";
}

interface AIAnalysisPanelProps {
  /** Table name for full-analysis mode */
  tableName?: string;
  /** SQL + results for explain/insights/charts mode */
  sql?: string;
  question?: string;
  results?: Record<string, unknown>[];
  /** Which analysis to run */
  mode: AnalysisMode;
  /** Optional callback when panel is closed */
  onClose?: () => void;
  /** Optional callback when full-analysis completes successfully */
  onComplete?: (table: string) => void;
  /** Optional callback when follow-up generates new SQL */
  onSqlGenerated?: (sql: string) => void;
}

// ── Main component ────────────────────────────────────────────
export function AIAnalysisPanel({
  tableName, sql, question, results, mode, onClose, onComplete, onSqlGenerated,
}: AIAnalysisPanelProps) {
  const { t, i18n } = useTranslation();
  const codeTheme = useCodeTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<AnalysisSection[]>([]);
  const [rawData, setRawData] = useState<unknown>(null);
  const [hasRun, setHasRun] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [chartSpecs, setChartSpecs] = useState<ChartSpec[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);

  // ── Run analysis ──────────────────────────────────────────
  const runAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSections([]);
    setRawData(null);
    setStreamingContent(null);
    setChartSpecs([]);
    setSuggestedQuestions([]);

    try {
      const builtSections: AnalysisSection[] = [];
      let raw: unknown = null;

      if (mode === "explain" && sql && question && results) {
        // Streaming explain — accumulate in local var + state for live render
        const sessionStore = useAiSessionStore.getState();
        const history = sessionStore.getRecentTurns(6).map((t) => ({
          role: t.role,
          content: t.content,
        }));

        let accumulated = "";
        setStreamingContent("");
        await new Promise<void>((resolve, reject) => {
          streamAiExplain(question, sql, results, {
            onChunk: (text) => {
              accumulated += text;
              setStreamingContent(accumulated);
            },
            onDone: () => resolve(),
            onError: (err) => reject(err),
          }, history.length > 0 ? history : undefined, i18n.language);
        });
        setSections([{
          title: t("ai.explanation"),
          content: accumulated || t("ai.no-explanation"),
          type: "markdown",
        }]);
        // Record turns in session store
        sessionStore.addUserTurn(question);
        sessionStore.addAssistantTurn(accumulated, sql);
        setStreamingContent(null);

        // Auto chart suggestion — non-blocking, silent on failure
        if (results && results.length > 0) {
          try {
            const chartRes = await aiChartSuggest(results, question, i18n.language);
            if (chartRes.recommended_charts?.length) {
              const specs: ChartSpec[] = chartRes.recommended_charts
                .filter((c) => ["bar", "line", "pie", "scatter"].includes(c.type))
                .slice(0, 2)
                .map((c) => ({
                  type: c.type as ChartSpec["type"],
                  title: c.title,
                  xKey: c.x_axis,
                  yKey: c.y_axis,
                  data: results,
                }));
              setChartSpecs(specs);
            }
          } catch {
            // chart-suggest failure is non-fatal
          }
        }

        setHasRun(true);
        setIsLoading(false);
        return;
      } else if (mode === "insights" && question && results) {
        const res = await aiInsights(question, results, i18n.language);
        raw = res;
        let md = "";
        if (res.insights?.length) {
          md += "### " + t("ai.key-insights") + "\n\n";
          res.insights.forEach((i) => { md += `- ${i}\n`; });
        }
        if (res.trends?.length) {
          md += "\n### " + t("ai.trends") + "\n\n";
          res.trends.forEach((t) => { md += `- ${t}\n`; });
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
        }
        builtSections.push({
          title: t("ai.chart-suggestions"),
          content: md || t("ai.no-charts"),
          type: "markdown",
        });
      } else if (mode === "full-analysis" && tableName) {
        const res = await analyzeTable(tableName, i18n.language);
        raw = res;

        // Profile section
        const profile = res.profile;
        let profileMd = `| ${t("ai.metric")} | ${t("ai.value")} |\n|---|---|\n`;
        profileMd += `| ${t("ai.rows")} | ${profile.row_count.toLocaleString()} |\n`;
        profileMd += `| ${t("ai.columns")} | ${profile.column_count} |\n`;
        profileMd += `| ${t("ai.null-pct")} | ${profile.null_pct}% |\n`;
        profileMd += `| ${t("ai.duplicates")} | ${profile.duplicate_rows.toLocaleString()} |\n`;
        builtSections.push({
          title: t("ai.data-profile"),
          content: profileMd,
          type: "markdown",
        });

        // Column details
        let colMd = `| ${t("ai.column")} | ${t("ai.type")} | ${t("ai.null-pct")} | ${t("ai.unique")} | ${t("ai.stats")} |\n|---|---|---|---|---|\n`;
        profile.columns.forEach((c) => {
          const stats = c.stats
            ? `mean=${c.stats.mean}, min=${c.stats.min}, max=${c.stats.max}`
            : c.top_values?.map((v) => `${v.value}(${v.count})`).join(", ") || "-";
          colMd += `| ${c.name} | ${c.dtype} | ${c.null_pct}% | ${c.unique_count} | ${stats} |\n`;
        });
        builtSections.push({
          title: t("ai.column-details"),
          content: colMd,
          type: "markdown",
        });

        // AI summary
        if (res.ai_summary) {
          builtSections.push({
            title: t("ai.summary"),
            content: res.ai_summary,
            type: "markdown",
          });
        }

        // Semantic dataset understanding — non-blocking
        try {
          const semCols = profile.columns.map((c) => ({ name: c.name, dtype: c.dtype }));
          const sampleRows = res.profile.columns.length > 0
            ? (res as unknown as { data?: Record<string, unknown>[] }).data?.slice(0, 5) ?? []
            : [];
          const semRes = await aiSemantics(tableName, semCols, sampleRows, i18n.language);
          if (semRes.status === "success" && semRes.summary) {
            let semMd = `**${semRes.summary}**\n\n`;
            if (semRes.detected_metrics?.length) {
              semMd += `**${t("ai.metrics")}:** ${semRes.detected_metrics.join(", ")}\n\n`;
            }
            if (semRes.detected_dimensions?.length) {
              semMd += `**${t("ai.dimensions")}:** ${semRes.detected_dimensions.join(", ")}\n\n`;
            }
            if (semRes.suggested_focus) {
              semMd += `**${t("ai.suggested-focus")}:** ${semRes.suggested_focus}\n\n`;
            }
            if (semRes.columns?.length) {
              semMd += `| ${t("ai.column")} | ${t("ai.semantic-role")} | ${t("ai.business-meaning")} |\n|---|---|---|\n`;
              semRes.columns.forEach((c) => {
                semMd += `| ${c.name} | ${c.semantic_role} | ${c.business_meaning} |\n`;
              });
            }
            builtSections.push({
              title: t("ai.semantic-understanding"),
              content: semMd,
              type: "markdown",
            });
          }
        } catch {
          // semantics failure is non-fatal
        }

        // Chart suggestions
        if (res.chart_suggestions?.length) {
          let chartMd = "";
          res.chart_suggestions.forEach((c) => {
            chartMd += `#### ${c.title}\n- **${t("ai.chart-type")}**: ${c.type}\n- **X**: ${c.x_axis} | **Y**: ${c.y_axis}\n- ${c.reason}\n\n`;
          });
          builtSections.push({
            title: t("ai.chart-suggestions"),
            content: chartMd,
            type: "markdown",
          });
        }

        // Suggested questions — non-blocking
        try {
          const sqRes = await aiSuggestQuestions(tableName, res.profile as unknown as Record<string, unknown>, undefined, i18n.language);
          if (sqRes.questions?.length) {
            setSuggestedQuestions(sqRes.questions);
          }
        } catch {
          // suggest-questions failure is non-fatal
        }
      }

      setSections(builtSections);
      setRawData(raw);
      setHasRun(true);
      if (mode === "full-analysis" && tableName && onComplete) {
        onComplete(tableName);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("ai.analysis-failed"));
    } finally {
      setIsLoading(false);
    }
  }, [mode, sql, question, results, tableName, t]);

  // ── Follow-up analysis ────────────────────────────────────
  const handleFollowUp = useCallback(async () => {
    const q = followUpQuestion.trim();
    if (!q || followUpLoading) return;

    setFollowUpLoading(true);
    setError(null);
    try {
      const sessionStore = useAiSessionStore.getState();

      // Build follow-up context from session store + current results
      const ctx: FollowUpContext = {};
      if (sessionStore.lastSql) ctx.previous_sql = sessionStore.lastSql;
      if (sessionStore.lastInsightSummary) ctx.previous_insight_summary = sessionStore.lastInsightSummary;
      if (results && results.length > 0) {
        ctx.previous_result_schema = Object.keys(results[0]).map((key) => {
          const val = results[0][key];
          const dtype = typeof val === "number" ? (Number.isInteger(val) ? "INTEGER" : "DOUBLE")
            : typeof val === "boolean" ? "BOOLEAN" : "VARCHAR";
          return { name: key, dtype };
        });
        ctx.previous_sample_rows = results.slice(0, 5);
      }

      // Generate SQL without executing — user confirms before execution
      const res = await aiQuery(q, false, true, Object.keys(ctx).length > 0 ? ctx : undefined, i18n.language);

      if (res.sql && res.status === "success") {
        sessionStore.addUserTurn(q);
        sessionStore.addAssistantTurn(res.sql, res.sql);
        onSqlGenerated?.(res.sql);
        toast.success(t("ai.sql-generated"));
        setFollowUpQuestion("");
      } else {
        setError(res.error || "AI could not generate SQL for this follow-up");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("ai.analysis-failed"));
    } finally {
      setFollowUpLoading(false);
    }
  }, [followUpQuestion, followUpLoading, results, onSqlGenerated, t]);

  // ── Copy to clipboard ─────────────────────────────────────
  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(
      () => toast.success(t("ai.copied")),
      () => toast.error(t("ai.copy-failed"))
    );
  }, [t]);

  // ── Export as markdown ─────────────────────────────────────
  const handleExportMd = useCallback(() => {
    const md = sections.map((s) => `## ${s.title}\n\n${s.content}`).join("\n\n---\n\n");
    downloadBlob(`ai-analysis-${tableName || "query"}.md`, md, "text/markdown");
    toast.success(t("ai.exported-md"));
  }, [sections, tableName, t]);

  // ── Export as JSON ─────────────────────────────────────────
  const handleExportJson = useCallback(() => {
    if (!rawData) return;
    const json = JSON.stringify(rawData, null, 2);
    downloadBlob(`ai-analysis-${tableName || "query"}.json`, json, "application/json");
    toast.success(t("ai.exported-json"));
  }, [rawData, tableName, t]);

  // ── Markdown components ───────────────────────────────────
  const markdownComponents = useMemo(() => ({
    code({ className, children, ...props }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
      const match = /language-(\w+)/.exec(className || "");
      const isInline = !match;
      if (isInline) {
        return (
          <code className="px-1.5 py-0.5 rounded text-xs font-mono bg-[var(--bg-tertiary)] text-[var(--accent)]" {...props}>
            {children}
          </code>
        );
      }
      return (
        <SyntaxHighlighter
          style={codeTheme as Record<string, React.CSSProperties>}
          language={match[1]}
          PreTag="div"
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      );
    },
    table({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
      return (
        <div className="overflow-x-auto my-2">
          <table className="min-w-full text-xs border-collapse border border-[var(--border-default)]" {...props}>
            {children}
          </table>
        </div>
      );
    },
    th({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) {
      return (
        <th className="px-3 py-1.5 text-left font-semibold bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-primary)]" {...props}>
          {children}
        </th>
      );
    },
    td({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) {
      return (
        <td className="px-3 py-1.5 border border-[var(--border-default)] text-[var(--text-secondary)]" {...props}>
          {children}
        </td>
      );
    },
    h3({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
      return <h3 className="text-sm font-semibold text-[var(--text-primary)] mt-3 mb-1" {...props}>{children}</h3>;
    },
    h4({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
      return <h4 className="text-xs font-semibold text-[var(--accent)] mt-2 mb-1" {...props}>{children}</h4>;
    },
    ul({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) {
      return <ul className="list-disc pl-4 space-y-0.5 text-sm text-[var(--text-secondary)]" {...props}>{children}</ul>;
    },
    li({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) {
      return <li className="text-sm" {...props}>{children}</li>;
    },
    p({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
      return <p className="text-sm text-[var(--text-secondary)] mb-1" {...props}>{children}</p>;
    },
    strong({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
      return <strong className="font-semibold text-[var(--text-primary)]" {...props}>{children}</strong>;
    },
  }), [codeTheme]);

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full border border-[var(--border-default)] rounded-lg overflow-hidden bg-[var(--bg-secondary)]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-tertiary)] border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
            {mode === "full-analysis" ? t("ai.full-analysis") :
             mode === "explain" ? t("ai.explain-title") :
             mode === "insights" ? t("ai.insights-title") :
             t("ai.charts-title")}
          </span>
          {tableName && (
            <span className="text-[10px] text-[var(--text-muted)] font-mono bg-[var(--bg-primary)] px-1.5 py-0.5 rounded">
              {tableName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!hasRun && !isLoading && (
            <button
              onClick={runAnalysis}
              className="px-2.5 py-1 text-xs bg-[var(--accent)] text-[var(--bg-primary)] rounded-md hover:opacity-90 transition-opacity font-medium"
            >
              {t("ai.run")}
            </button>
          )}
          {sections.length > 0 && (
            <>
              <button
                onClick={() => handleCopy(sections.map((s) => `## ${s.title}\n\n${s.content}`).join("\n\n"))}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                title={t("ai.copy-all")}
              >
                <CopyIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleExportMd}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                title={t("ai.export-md")}
              >
                <ExportIcon className="w-3.5 h-3.5" />
              </button>
              {rawData && (
                <button
                  onClick={handleExportJson}
                  className="px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] border border-[var(--border-default)] rounded transition-colors"
                  title={t("ai.export-json")}
                >
                  JSON
                </button>
              )}
            </>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors ml-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Loading state */}
        {isLoading && <AnalysisSkeleton />}

        {/* Error state */}
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

        {/* Empty state */}
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

        {/* Streaming content (live render during explain/insights) */}
        {streamingContent !== null && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
                {t("ai.explanation")}
              </h3>
              <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            </div>
            <div className="ai-markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {streamingContent}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Results (final, after streaming completes) */}
        {sections.map((section, i) => (
          <div key={i} className="mb-4 last:mb-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
                {section.title}
              </h3>
              <button
                onClick={() => handleCopy(section.content)}
                className="p-0.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                title={t("ai.copy-section")}
              >
                <CopyIcon className="w-3 h-3" />
              </button>
            </div>
            <div className="ai-markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {section.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {/* Charts — auto-generated by AI after explain */}
        {chartSpecs.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[var(--border-default)] space-y-4">
            {chartSpecs.map((spec, i) => (
              <AiChart key={i} spec={spec} />
            ))}
          </div>
        )}

        {/* Suggested questions — AI-recommended next analyses */}
        {suggestedQuestions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[var(--border-default)]">
            <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">
              {t("ai.suggested-questions")}
            </p>
            <div className="space-y-1.5">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (onSqlGenerated) {
                      setFollowUpQuestion(q.question);
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded-md bg-[var(--bg-primary)] border border-[var(--border-default)] hover:border-[var(--accent)] transition-colors group"
                >
                  <p className="text-xs text-[var(--text-primary)] group-hover:text-[var(--accent)]">{q.question}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{q.reason}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up input — shown after results when onSqlGenerated is available */}
        {hasRun && !isLoading && onSqlGenerated && (mode === "explain" || mode === "full-analysis") && (
          <div className="mt-4 pt-3 border-t border-[var(--border-default)]">
            <p className="text-xs text-[var(--text-muted)] mb-2">{t("ai.follow-up-hint")}</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={followUpQuestion}
                onChange={(e) => setFollowUpQuestion(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleFollowUp(); }}
                placeholder={t("ai.follow-up-placeholder")}
                className="flex-1 px-3 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-md text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                disabled={followUpLoading}
              />
              <button
                onClick={handleFollowUp}
                disabled={followUpLoading || !followUpQuestion.trim()}
                className="px-3 py-1.5 text-xs bg-[var(--accent)] text-[var(--bg-primary)] rounded-md hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
              >
                {followUpLoading ? t("ai.generating") : t("ai.generate-sql")}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
