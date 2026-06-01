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
import { InvestigationLayout } from "./investigation-layout";
import { ContextPanel } from "./context-panel";
import { ToolsPanel } from "./tools-panel";
import { QuestionInput } from "./question-input";
import { StreamingOutput, type InvestigationResult } from "./streaming-output";
import { StreamingIndicator } from "./ai-streaming-indicator";
import type { ChartSpec } from "@/types";
import type { AnomalyResult } from "@/types";

export function InvestigationWorkspace() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const addRun = useAnalysisStore((s) => s.addRun);
  const updateRun = useAnalysisStore((s) => s.updateRun);
  const activeRunId = useAnalysisStore((s) => s.activeRunId);
  // Subscribe to specific fields to avoid unnecessary re-renders
  const keyFindings = useInvestigationStore((s) => s.keyFindings);
  // Get stable action references (Zustand actions are stable by default)
  const investigation = useInvestigationStore;

  const [isLoading, setIsLoading] = useState(false);
  const [streamStage, setStreamStage] = useState("");
  const [streamStep, setStreamStep] = useState<number | undefined>();
  const [streamEvent, setStreamEvent] = useState<MultiStreamEvent | null>(null);
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleStart = useCallback(async (question: string, table: string, mode: AnalysisMode) => {
    // Abort any in-progress stream
    abortRef.current?.abort();

    // Reset investigation context — prevents bleed between investigations (B1)
    const store = useInvestigationStore.getState();
    store.clear();
    store.reset();

    setIsLoading(true);
    setStreamStage("");
    setStreamStep(undefined);
    setStreamEvent(null);
    setResult(null);
    setError(undefined);

    // Create run
    const runId = addRun(mode, question, table);
    setCurrentRunId(runId);
    store.addUserTurn(question);
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

    const abort = streamAiAnalyzeMulti(
      question,
      table,
      columns,
      sampleRows,
      {
        onPlan: (plan) => {
          setStreamStage("plan");
          accumulatedPlan = plan;
          setStreamEvent({ type: "plan", plan });
        },
        onStepStart: (step, purpose) => {
          setStreamStage("step");
          setStreamStep(step);
        },
        onStepRetry: (step, attempt, errMsg) => {
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
          setError(err.message);
          setIsLoading(false);
          setStreamStage("");
          updateRun(runId, { status: "error", error: err.message });
          useInvestigationStore.getState().advance("done");
          toast.error(err.message);
        },
        onDone: (data) => {
          setIsLoading(false);
          setStreamStage("");

          accumulatedTrace = data?.trace as Record<string, unknown> | undefined;

          // Build result
          const finalResult: InvestigationResult = {
            plan: accumulatedPlan,
            steps: accumulatedSteps,
            sections: accumulatedSections,
            summary: accumulatedSummary,
            trace: accumulatedTrace,
          };

          setResult(finalResult);

          // Update analysis run
          updateRun(runId, {
            status: "success",
            sections: accumulatedSections,
            multiResult: {
              question,
              plan: accumulatedPlan,
              steps: accumulatedSteps,
              summary: accumulatedSummary,
              status: "success",
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

          // Update investigation context
          const doneStore = useInvestigationStore.getState();
          doneStore.addAssistantTurn(accumulatedSummary, accumulatedSteps[accumulatedSteps.length - 1]?.sql);
          doneStore.advance("done");

          // Extract key findings from sections
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
      keyFindings.length > 0 ? keyFindings.slice(0, 5) : undefined
    );

    abortRef.current = abort;
  }, [addRun, updateRun, keyFindings, i18n.language, t]);

  const handleTableSelect = useCallback((table: string) => {
    useInvestigationStore.getState().advance("profiling", { table });
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

  return (
    <InvestigationLayout
      context={<ContextPanel onTableSelect={handleTableSelect} />}
      tools={<ToolsPanel />}
      main={
        <div className="p-4 space-y-4 max-w-4xl mx-auto">
          <QuestionInput onStart={handleStart} isLoading={isLoading} />

          {isLoading && streamStage && (
            <StreamingIndicator stage={streamStage} step={streamStep} />
          )}

          <StreamingOutput
            result={result}
            streamEvent={streamEvent}
            isStreaming={isLoading}
            streamStage={streamStage}
            streamStep={streamStep}
            error={error}
          />

          {result && currentRunId && (
            <div className="flex justify-end pt-2 border-t border-[var(--border-default)]">
              <button
                onClick={() => router.push(`/analyze/${currentRunId}`)}
                className="px-3 py-1 text-xs text-[var(--accent)] hover:underline"
              >
                {t("inv.run-detail")} →
              </button>
            </div>
          )}
        </div>
      }
    />
  );
}

// Import type for trace
import type { TraceSnapshot } from "@/stores/analysis-store";
