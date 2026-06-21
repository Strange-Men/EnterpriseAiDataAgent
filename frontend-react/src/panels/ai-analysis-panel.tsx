"use client";

import { useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { aiEvaluate } from "@/services/api";
import { useInvestigationStore } from "@/stores/investigation-store";
import { useAnalysisStore, type AnalysisMode, type TraceSnapshot } from "@/stores/analysis-store";
import { AiChart } from "@/components/ui/ai-chart";
import type { AnomalyResult } from "@/types";
import { AnalysisHeader } from "@/components/ai/analysis-header";
import { AnalysisSectionView } from "@/components/ai/analysis-section";
import { StepResults } from "@/components/ai/step-results";
import { TraceTimeline } from "@/components/ai/trace-timeline";
import { FollowUpInput } from "@/components/ai/follow-up-input";
import { renderSafeText, safeArray } from "@/utils/safe-render";

import { AnalysisSkeleton } from "@/components/ai/analysis-skeleton";
import { SuggestedQuestions } from "@/components/ai/suggested-questions";
import {
  type ModeResult,
  runAnomaliesMode,
  runAutonomousMode,
  runChartsMode,
  runExplainMode,
  runFullAnalysisMode,
  runInsightsMode,
} from "@/panels/ai-analysis-modes";
import { useAiAnalysisPanelState } from "@/hooks/use-ai-analysis-panel-state";
// Re-export for consumers
export type { AnalysisSection, AnalysisMode } from "@/stores/analysis-store";

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

  const {
    isLoading, setIsLoading,
    error, setError,
    sections, setSections,
    rawData, setRawData,
    hasRun, setHasRun,
    streamingContent, setStreamingContent,
    streamingError, setStreamingError,
    chartSpecs, setChartSpecs,
    suggestedQuestions, setSuggestedQuestions,
    multiResult, setMultiResult,
    trace, setTrace,
    followUpQuestion, setFollowUpQuestion,
    drillDownFindings, setDrillDownFindings,
    evaluation, setEvaluation,
    progressInfo, setProgressInfo,
    elapsedSeconds, setElapsedSeconds,
  } = useAiAnalysisPanelState();

  const streamAbortRef = useRef<AbortController | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

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
  }, [
    mode, sql, question, results, tableName, t, i18n.language, streamingContent, onComplete,
    setChartSpecs, setDrillDownFindings, setElapsedSeconds, setError, setEvaluation,
    setFollowUpQuestion, setHasRun, setIsLoading, setMultiResult, setProgressInfo,
    setRawData, setSections, setStreamingContent, setStreamingError, setSuggestedQuestions,
    setTrace,
  ]);

  // ── Retry streaming (preserves partial content) ───────────
  const retryStreaming = useCallback(() => {
    setStreamingError(null);
    setStreamingContent(null);
    runAnalysis();
  }, [runAnalysis, setStreamingContent, setStreamingError]);

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
            <p className="text-xs text-red-300">{renderSafeText(error, t("ai.analysis-failed"))}</p>
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
                  <div key={s.step} className="flex items-center gap-2 text-xs">
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
            <p className="text-xs text-amber-300 mb-2">{renderSafeText(streamingError, t("ai.analysis-failed"))}</p>
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
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{t("ai.drill-down-hint")}</p>
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
                  <span key={dim} className={`text-xs px-2 py-0.5 rounded-full border ${color}`}>
                    {t(`ai.${dim}`)}: {val}
                  </span>
                );
              })}
            </div>
            {/* Quality gate warnings */}
            {evaluation.quality_gates && !evaluation.quality_gates.passed && (
              <div className="mb-2 px-2 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
                {safeArray<string>(evaluation.quality_gates.warnings).map((w, i) => (
                  <p key={i} className="text-xs text-amber-300">⚠ {renderSafeText(w)}</p>
                ))}
              </div>
            )}
            {/* Diagnostics */}
            {safeArray<string>(evaluation.diagnostics).length > 0 && (
              <div className="mb-1">
                <p className="text-xs font-medium text-[var(--text-muted)] mb-0.5">{t("ai.diagnostics")}</p>
                {safeArray<string>(evaluation.diagnostics).map((d, i) => (
                  <p key={i} className="text-xs text-[var(--text-secondary)]">- {renderSafeText(d)}</p>
                ))}
              </div>
            )}
            {/* Suggested improvements */}
            {safeArray<string>(evaluation.suggested_improvements).length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)] mb-0.5">{t("ai.improvements")}</p>
                {safeArray<string>(evaluation.suggested_improvements).map((imp, i) => (
                  <p key={i} className="text-xs text-[var(--text-secondary)]">- {renderSafeText(imp)}</p>
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
