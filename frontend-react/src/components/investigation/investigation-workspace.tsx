"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  streamAiAnalyzeMulti,
  fetchTableData,
  type MultiStreamEvent,
  type MultiStepExecuted,
  type PlanStep,
} from "@/services/api";
import { useAnalysisStore, type AnalysisMode } from "@/stores/analysis-store";
import { useInvestigationStore } from "@/stores/investigation-store";
import { useDataStore } from "@/stores/data-store";
import { useSqlHistoryStore } from "@/stores/sql-history-store";
import { generateId } from "@/utils/id";
import { StreamingOutput, type InvestigationResult } from "./streaming-output";
import { StreamingIndicator } from "./ai-streaming-indicator";
import { SqlWorkspacePanel } from "@/panels/sql-workspace-panel";
import { Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lightbulb, Code, Square } from "lucide-react";
import type { TraceSnapshot } from "@/stores/analysis-store";

type WorkspaceTab = "ai-query" | "expert-sql";

export function InvestigationWorkspace() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const addRun = useAnalysisStore((s) => s.addRun);
  const updateRun = useAnalysisStore((s) => s.updateRun);
  const activeRunId = useAnalysisStore((s) => s.activeRunId);
  const tables = useDataStore((s) => s.tables);
  const activeTable = useInvestigationStore((s) => s.activeTable);
  const setActiveTable = useInvestigationStore((s) => s.setActiveTable);
  const ensureValidSelectedTable = useInvestigationStore((s) => s.ensureValidSelectedTable);

  const [activeTab, setActiveTab] = useState<WorkspaceTab>("ai-query");
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamStage, setStreamStage] = useState("");
  const [streamStep, setStreamStep] = useState<number | undefined>();
  const [streamEvent, setStreamEvent] = useState<MultiStreamEvent | null>(null);
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const startTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  // Listen for tab switch events from SqlWorkspacePanel
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === "ai-query" || detail === "expert-sql") {
        setActiveTab(detail);
      }
    };
    window.addEventListener("workspace:switch-tab", handler);
    return () => window.removeEventListener("workspace:switch-tab", handler);
  }, []);

  // Validate activeTable against available tables on mount / table list change
  useEffect(() => {
    if (tables.length > 0) {
      ensureValidSelectedTable(tables.map((t) => t.name));
    }
  }, [tables, ensureValidSelectedTable]);

  const handleSubmit = useCallback(async () => {
    const q = question.trim();
    const table = activeTable || tables[0]?.name;
    if (!q || !table || isLoading) return;

    // Abort any in-progress stream
    abortRef.current?.abort();
    startTimeRef.current = Date.now();

    // Reset investigation context
    const store = useInvestigationStore.getState();
    store.clear();
    store.reset();

    setIsLoading(true);
    setStreamStage("");
    setStreamStep(undefined);
    setStreamEvent(null);
    setResult(null);
    setError(undefined);

    // Create run — always use "autonomous" mode internally
    const mode: AnalysisMode = "autonomous";
    const runId = addRun(mode, q, table);
    setCurrentRunId(runId);
    store.addUserTurn(q);
    store.advance("analyzing", { table });

    // Fetch table data for context
    let columns: { name: string; dtype: string }[] = [];
    let sampleRows: Record<string, unknown>[] = [];
    try {
      const { data } = await fetchTableData(table, 10);
      sampleRows = data;
      if (data.length > 0) {
        columns = Object.keys(data[0]).map((key) => {
          const val = data[0][key];
          const dtype = typeof val === "number" ? (Number.isInteger(val) ? "INTEGER" : "DOUBLE")
            : typeof val === "boolean" ? "BOOLEAN" : "VARCHAR";
          return { name: key, dtype };
        });
      }
    } catch {
      // Continue without sample data
    }

    const accumulatedSteps: MultiStepExecuted[] = [];
    let accumulatedPlan: PlanStep[] = [];
    const accumulatedSections: { title: string; content: string; type: "markdown" | "sql" | "json" }[] = [];
    let accumulatedSummary = "";
    let accumulatedTrace: Record<string, unknown> | undefined;

    const latestKeyFindings = useInvestigationStore.getState().keyFindings;
    const abort = streamAiAnalyzeMulti(
      q,
      table,
      columns,
      sampleRows,
      {
        onPlan: (plan) => {
          setStreamStage("plan");
          accumulatedPlan = plan;
          setStreamEvent({ type: "plan", plan });
        },
        onStepStart: (step, _purpose) => {
          setStreamStage("step");
          setStreamStep(step);
        },
        onStepRetry: (_step, _attempt, _errMsg) => {
          // Update the step to show retry
        },
        onStepResult: (event) => {
          setStreamStage("step");
          setStreamStep(event.step);
          setStreamEvent(event);
          if (event.columns && event.data) {
            accumulatedSteps.push({
              step: event.step ?? accumulatedSteps.length + 1,
              purpose: event.purpose ?? "",
              status: event.status ?? "success",
              sql: event.sql ?? "",
              columns: event.columns,
              data: event.data,
              row_count: event.row_count,
              error: event.error,
            });
          }
        },
        onSummary: (summary) => {
          setStreamStage("summary");
          accumulatedSummary = summary;
        },
        onError: (err) => {
          if (!mountedRef.current) return;
          setError(err.message);
          setIsLoading(false);
          setStreamStage("");
          updateRun(runId, { status: "error", error: err.message });
          useInvestigationStore.getState().advance("done");
          toast.error(err.message);
        },
        onDone: (data) => {
          if (!mountedRef.current) return;
          setIsLoading(false);
          setStreamStage("");

          accumulatedTrace = data?.trace as Record<string, unknown> | undefined;

          const finalResult: InvestigationResult = {
            plan: accumulatedPlan,
            steps: accumulatedSteps,
            sections: accumulatedSections,
            summary: accumulatedSummary,
            trace: accumulatedTrace,
          };

          setResult(finalResult);

          // Determine status based on step results
          const hasErrors = accumulatedSteps.some((s) => s.status === "error");
          const runStatus = hasErrors ? "partial" as const : "success" as const;

          updateRun(runId, {
            status: runStatus === "partial" ? "error" : "success",
            sections: accumulatedSections,
            multiResult: {
              question: q,
              plan: accumulatedPlan,
              steps: accumulatedSteps,
              summary: accumulatedSummary,
              status: runStatus === "partial" ? "error" : "success",
            },
            trace: accumulatedTrace ? {
              trace_id: (accumulatedTrace.trace_id as string) ?? runId,
              total_llm_calls: (accumulatedTrace.total_llm_calls as number) ?? accumulatedSteps.length,
              total_input_tokens: (accumulatedTrace.total_input_tokens as number) ?? 0,
              total_output_tokens: (accumulatedTrace.total_output_tokens as number) ?? 0,
              events: (accumulatedTrace.events as TraceSnapshot["events"]) ?? [],
              guardrail_violations: (data?.guardrail_violations as string[]) ?? [],
            } : null,
          });

          // Write to unified history store
          const totalRows = accumulatedSteps.reduce((sum, s) => sum + (s.row_count ?? 0), 0);
          const lastSql = accumulatedSteps[accumulatedSteps.length - 1]?.sql ?? "";
          const summaryText = accumulatedSummary
            ? accumulatedSummary.slice(0, 120) + (accumulatedSummary.length > 120 ? "..." : "")
            : q;
          useSqlHistoryStore.getState().addEntry({
            id: generateId(),
            type: "ai",
            sql: lastSql,
            question: q,
            tableName: table,
            summary: summaryText,
            status: runStatus,
            runtimeMs: Date.now() - startTimeRef.current,
            rowCount: totalRows,
            error: null,
            timestamp: new Date().toISOString(),
          });

          const doneStore = useInvestigationStore.getState();
          doneStore.addAssistantTurn(accumulatedSummary, accumulatedSteps[accumulatedSteps.length - 1]?.sql);
          doneStore.advance("done");

          if (accumulatedSummary) {
            const sentences = accumulatedSummary.split(/[.!?]+/).filter((s) => s.trim().length > 10);
            sentences.slice(0, 5).forEach((s) => doneStore.addKeyFinding(s.trim()));
          }

          setStreamEvent(data ?? null);
          toast.success(t("inv.done"));
        },
      },
      i18n.language,
      500,
      latestKeyFindings.length > 0 ? latestKeyFindings.slice(0, 5) : undefined
    );

    abortRef.current = abort;
  }, [question, activeTable, tables, isLoading, addRun, updateRun, i18n.language, t]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
    setStreamStage("");
    setStreamStep(undefined);
    toast(t("ai.stopped"), { icon: "⏹" });
  }, [t]);

  const handleExampleClick = useCallback((example: string) => {
    setQuestion(example);
  }, []);

  // Load existing run if activeRunId is set from navigation
  useEffect(() => {
    if (activeRunId && !currentRunId) {
      const run = useAnalysisStore.getState().runs.find((r) => r.id === activeRunId);
      if (run && run.status === "success") {
        setResult({
          sections: run.sections,
          summary: run.multiResult?.summary,
          steps: run.multiResult?.steps,
          trace: run.trace as unknown as Record<string, unknown>,
        });
        setCurrentRunId(activeRunId);
      }
    }
  }, [activeRunId, currentRunId]);

  const currentTableName = activeTable || tables[0]?.name;
  const currentTableMeta = tables.find((tbl) => tbl.name === currentTableName);

  return (
    <div className="flex flex-col h-full">
      {/* Tab Bar */}
      <div className="flex items-center border-b border-[var(--border-default)] bg-[var(--bg-secondary)] shrink-0">
        <button
          onClick={() => setActiveTab("ai-query")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "ai-query"
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          {t("workspace.tab.ai-query")}
        </button>
        <button
          onClick={() => setActiveTab("expert-sql")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "expert-sql"
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          {t("workspace.tab.expert-sql")}
        </button>

        {/* Table info badge */}
        {currentTableName && (
          <div className="ml-auto px-3 py-1 text-xs text-[var(--text-muted)]">
            <span className="uppercase tracking-wider">{t("workspace.current-table")}:</span>{" "}
            <span className="text-[var(--text-primary)] font-medium">{currentTableName}</span>
            {currentTableMeta && (
              <span className="ml-1">({currentTableMeta.rowCount} rows)</span>
            )}
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === "ai-query" ? (
          <div className="p-6 max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {t("workspace.ai-query-title")}
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                {t("workspace.ai-query-subtitle")}
              </p>
            </div>

            {/* Table selector */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider shrink-0">
                {t("inv.table-label")}
              </label>
              {tables.length > 0 ? (
                <Select
                  value={activeTable || tables[0]?.name || ""}
                  onChange={(e) => setActiveTable(e.target.value)}
                  disabled={isLoading}
                >
                  {tables.map((tbl) => (
                    <option key={tbl.name} value={tbl.name}>
                      {tbl.name} ({tbl.rowCount} rows)
                    </option>
                  ))}
                </Select>
              ) : (
                <span className="text-xs text-[var(--text-muted)] italic">
                  {t("workspace.no-table")}
                </span>
              )}
            </div>

            {/* Question input */}
            <div className="space-y-3">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder={t("inv.question-placeholder")}
                rows={4}
                className="!text-sm !rounded-lg !resize-none"
                disabled={isLoading}
              />

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={!question.trim() || !currentTableName || isLoading}
                  variant="primary"
                  size="md"
                  loading={isLoading}
                >
                  {isLoading ? t("inv.running") : t("workspace.generate-sql-analyze")}
                </Button>
                {isLoading && (
                  <Button
                    onClick={handleStop}
                    variant="ghost"
                    size="md"
                    leftIcon={<Square className="w-3.5 h-3.5" />}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    {t("ai.stop")}
                  </Button>
                )}
              </div>
            </div>

            {/* Example questions */}
            {!result && !isLoading && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="w-3 h-3 text-[var(--text-muted)]" />
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                    {t("workspace.example-questions")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    t("workspace.example.q1"),
                    t("workspace.example.q2"),
                    t("workspace.example.q3"),
                    t("workspace.example.q4"),
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() => handleExampleClick(example)}
                      className="px-3 py-1.5 text-xs text-[var(--text-muted)] border border-[var(--border-default)] rounded-full hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Streaming indicator */}
            {isLoading && streamStage && (
              <StreamingIndicator stage={streamStage} step={streamStep} />
            )}

            {/* Results */}
            <StreamingOutput
              result={result}
              streamEvent={streamEvent}
              isStreaming={isLoading}
              streamStage={streamStage}
              streamStep={streamStep}
              error={error}
              onRetry={handleSubmit}
            />

            {/* Link to run detail */}
            {result && currentRunId && (
              <div className="space-y-2 pt-2 border-t border-[var(--border-default)]">
                <p className="text-xs text-[var(--text-muted)]">
                  {t("workspace.result-hint")}
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => router.push(`/analyze/${currentRunId}`)}
                    className="px-3 py-1 text-xs text-[var(--accent)] hover:underline"
                  >
                    {t("inv.run-detail")} →
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Expert SQL Tab */
          <div className="flex flex-col h-full p-4">
            <SqlWorkspacePanel />
          </div>
        )}
      </div>
    </div>
  );
}
