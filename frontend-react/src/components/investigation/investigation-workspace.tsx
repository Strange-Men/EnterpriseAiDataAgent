"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createAgentRun,
  type AgentProviderRequested,
  type AgentToolCall,
  type CreateAgentRunResponse,
} from "@/services/api";
import { useDataStore } from "@/stores/data-store";
import { useAnalysisStore } from "@/stores/analysis-store";
import { useInvestigationStore } from "@/stores/investigation-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { SqlWorkspacePanel } from "@/panels/sql-workspace-panel";
import { Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Database, Lightbulb, TerminalSquare } from "lucide-react";

const PROVIDER_OPTIONS: Array<{ value: AgentProviderRequested; labelKey: string }> = [
  { value: "mock", labelKey: "ai.llm-provider-mock" },
  { value: "deepseek", labelKey: "ai.llm-provider-deepseek" },
  { value: "doubao", labelKey: "ai.llm-provider-doubao" },
  { value: "mimo", labelKey: "ai.llm-provider-mimo" },
  { value: "openai", labelKey: "ai.llm-provider-openai" },
];

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function toStringList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => stringifyValue(item)).filter(Boolean);
  }
  const text = stringifyValue(value);
  return text ? [text] : [];
}

function getRunWarnings(response: CreateAgentRunResponse | null): string[] {
  if (!response) return [];
  const responseWarnings = toStringList(response.warnings);
  const runWarnings = toStringList(response.run.warnings);
  return [...responseWarnings, ...runWarnings];
}

function JsonBlock({ value }: { value: unknown }) {
  const text = stringifyValue(value);
  if (!text) return null;
  return (
    <pre className="max-h-56 overflow-auto rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] p-3 text-xs text-[var(--text-secondary)] whitespace-pre-wrap">
      {text}
    </pre>
  );
}

function ToolCallList({ calls }: { calls?: AgentToolCall[] }) {
  const { t } = useTranslation();

  if (!calls || calls.length === 0) {
    return (
      <p className="text-xs text-[var(--text-muted)]">
        {t("agent.result.no-tool-calls")}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {calls.map((call, index) => (
        <div
          key={call.call_id ?? `${call.tool_name ?? "tool"}-${index}`}
          className="rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-[var(--text-primary)]">
              {call.tool_name ?? t("agent.result.tool-fallback", { index: index + 1 })}
            </p>
            <Badge variant={call.status === "error" ? "error" : "muted"}>
              {call.status ?? t("agent.result.status-unknown")}
            </Badge>
          </div>
          {Object.keys(call).length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)]">
                {t("agent.result.view-tool-payload")}
              </summary>
              <div className="mt-2">
                <JsonBlock value={call} />
              </div>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}

export function InvestigationWorkspace() {
  const { t } = useTranslation();
  const setActiveRun = useAnalysisStore((s) => s.setActiveRun);
  const tables = useDataStore((s) => s.tables);
  const activeTable = useInvestigationStore((s) => s.activeTable);
  const setActiveTable = useInvestigationStore((s) => s.setActiveTable);
  const ensureValidSelectedTable = useInvestigationStore((s) => s.ensureValidSelectedTable);
  const llmProvider = useWorkspaceStore((s) => s.llmProvider);
  const pendingRerunDraft = useWorkspaceStore((s) => s.pendingRerunDraft);
  const setPendingRerunDraft = useWorkspaceStore((s) => s.setPendingRerunDraft);

  const [agentQuestion, setAgentQuestion] = useState("");
  const [agentProvider, setAgentProvider] = useState<AgentProviderRequested>(llmProvider);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [agentRunResult, setAgentRunResult] = useState<CreateAgentRunResponse | null>(null);
  const [agentRunError, setAgentRunError] = useState<string | null>(null);

  useEffect(() => {
    setActiveRun(null);
  }, [setActiveRun]);

  useEffect(() => {
    if (tables.length > 0) {
      ensureValidSelectedTable(tables.map((table) => table.name));
    }
  }, [tables, ensureValidSelectedTable]);

  useEffect(() => {
    if (!pendingRerunDraft) return;
    setAgentQuestion(pendingRerunDraft.question);
    if (pendingRerunDraft.tableName && tables.some((table) => table.name === pendingRerunDraft.tableName)) {
      setActiveTable(pendingRerunDraft.tableName);
    }
    setPendingRerunDraft(null);
  }, [pendingRerunDraft, setActiveTable, setPendingRerunDraft, tables]);

  const currentTableName = activeTable || tables[0]?.name;
  const currentTableMeta = tables.find((table) => table.name === currentTableName);
  const warnings = getRunWarnings(agentRunResult);
  const resultRun = agentRunResult?.run;
  const evidence = resultRun?.evidence ?? resultRun?.result_preview;
  const trace = resultRun?.trace ?? agentRunResult?.trace;
  const fallbackTriggered = Boolean(resultRun?.fallback_triggered);
  const userReadableAnswer = resultRun?.answer
    || (fallbackTriggered ? t("agent.result.mock-answer") : "");
  const statusLabel = resultRun?.status === "completed"
    ? t("agent.result.status-completed")
    : resultRun?.status === "failed"
      ? t("agent.result.status-failed")
      : resultRun?.status === "running"
        ? t("agent.result.status-running")
        : resultRun?.status;

  const examples = useMemo(
    () => [
      t("workspace.example.q1"),
      t("workspace.example.q2"),
      t("workspace.example.q3"),
      t("workspace.example.q4"),
    ],
    [t]
  );

  const handleAgentRun = useCallback(async () => {
    const question = agentQuestion.trim();
    const table = currentTableName;

    if (!question) {
      setAgentRunError(t("agent.error.empty-question"));
      return;
    }

    if (!table) {
      setAgentRunError(t("agent.error.no-table"));
      return;
    }

    setIsAgentRunning(true);
    setAgentRunError(null);
    setAgentRunResult(null);

    try {
      const response = await createAgentRun({
        user_input: question,
        table_name: table,
        provider_requested: agentProvider,
        mode: "skeleton",
      });
      setAgentRunResult(response);
    } catch (error) {
      setAgentRunError(error instanceof Error ? error.message : t("agent.error.run-failed"));
    } finally {
      setIsAgentRunning(false);
    }
  }, [agentProvider, agentQuestion, currentTableName, t]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center border-b border-[var(--border-default)] bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-[var(--accent)]">
          <Bot className="h-3.5 w-3.5" />
          {t("workspace.tab.agent-analysis")}
        </div>

        {currentTableName && (
          <div className="ml-auto px-3 py-1 text-xs text-[var(--text-muted)]">
            <span className="uppercase tracking-wider">{t("workspace.current-table")}:</span>{" "}
            <span className="font-medium text-[var(--text-primary)]">{currentTableName}</span>
            {currentTableMeta && (
              <span className="ml-1">({currentTableMeta.rowCount.toLocaleString()} {t("table.rows-label")})</span>
            )}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl space-y-6 p-6">
            <div className="space-y-2 text-center">
              <div className="flex items-center justify-center gap-2">
                <Bot className="h-5 w-5 text-[var(--accent)]" />
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  {t("agent.title")}
                </h2>
              </div>
              <p className="mx-auto max-w-2xl text-sm text-[var(--text-muted)]">
                {t("agent.subtitle")}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("agent.request.title")}</CardTitle>
                <CardDescription>{t("agent.request.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                      {t("inv.table-label")}
                    </label>
                    {tables.length > 0 ? (
                      <Select
                        value={currentTableName ?? ""}
                        onChange={(event) => setActiveTable(event.target.value)}
                        disabled={isAgentRunning}
                      >
                        {tables.map((table) => (
                          <option key={table.name} value={table.name}>
                            {table.name} ({table.rowCount.toLocaleString()} {t("table.rows-label")})
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-xs text-[var(--text-muted)]">
                        {t("workspace.no-table")}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                      {t("agent.provider.label")}
                    </label>
                    <Select
                      value={agentProvider}
                      onChange={(event) => setAgentProvider(event.target.value)}
                      disabled={isAgentRunning}
                    >
                      {PROVIDER_OPTIONS.map((provider) => (
                        <option key={provider.value} value={provider.value}>
                          {t(provider.labelKey)}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <Textarea
                  value={agentQuestion}
                  onChange={(event) => setAgentQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleAgentRun();
                    }
                  }}
                  placeholder={t("agent.question.placeholder")}
                  rows={4}
                  className="!resize-none !rounded-lg !text-sm"
                  disabled={isAgentRunning}
                />

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="info">{t("agent.badge.demo")}</Badge>
                  <Badge variant="muted">{t("agent.badge.memory")}</Badge>
                  <span className="text-xs text-[var(--text-muted)]">
                    {t("agent.provider.hint")}
                  </span>
                </div>

                <div className="flex flex-col gap-3 border-t border-[var(--border-default)] pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <Database className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <span>{t("agent.flow-hint")}</span>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    loading={isAgentRunning}
                    disabled={!agentQuestion.trim() || !currentTableName || isAgentRunning}
                    onClick={handleAgentRun}
                  >
                    {isAgentRunning ? t("agent.running") : t("agent.run")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {!agentRunResult && !agentRunError && !isAgentRunning && (
              <Card>
                <CardContent className="space-y-3 py-5">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-[var(--text-muted)]" />
                    <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      {t("workspace.example-questions")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {examples.map((example) => (
                      <button
                        key={example}
                        onClick={() => setAgentQuestion(example)}
                        className="rounded-full border border-[var(--border-default)] px-3 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {agentRunError && (
              <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--danger-subtle)] px-3 py-2">
                <p className="text-xs font-medium text-[var(--error)]">{t("agent.error.title")}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{agentRunError}</p>
              </div>
            )}

            {isAgentRunning && (
              <div className="flex items-center gap-2 px-1">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
                <p className="text-xs text-[var(--text-muted)]">{t("agent.loading")}</p>
              </div>
            )}

            {resultRun && (
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle>{t("agent.result.title")}</CardTitle>
                      <CardDescription>{t("agent.result.description")}</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={resultRun.status === "completed" ? "success" : "muted"}>
                        {statusLabel}
                      </Badge>
                      {fallbackTriggered && <Badge variant="warning">{t("agent.result.fallback")}</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userReadableAnswer && (
                    <section className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                        {t("agent.result.answer")}
                      </h3>
                      <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm leading-6 text-[var(--text-primary)]">
                        {userReadableAnswer}
                      </div>
                    </section>
                  )}

                  {resultRun.intent && (
                    <section className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                        {t("agent.result.key-findings")}
                      </h3>
                      <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-secondary)]">
                        {resultRun.intent}
                      </div>
                    </section>
                  )}

                  {resultRun.sql && (
                    <section className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                        {t("agent.result.sql")}
                      </h3>
                      <pre className="overflow-auto rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] p-3 text-xs text-[var(--text-secondary)]">
                        {resultRun.sql}
                      </pre>
                    </section>
                  )}

                  {evidence !== undefined && evidence !== null && (
                    <section className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                        {t("agent.result.evidence")}
                      </h3>
                      <JsonBlock value={evidence} />
                    </section>
                  )}

                  {warnings.length > 0 && (
                    <section className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2">
                      <h3 className="text-xs font-medium text-yellow-300">{t("agent.result.warnings")}</h3>
                      <ul className="mt-1 space-y-1 text-xs text-yellow-200">
                        {warnings.map((warning, index) => (
                          <li key={`${warning}-${index}`}>{warning}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  <details className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2">
                    <summary className="cursor-pointer text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)]">
                      {t("agent.result.technical-details")}
                    </summary>
                    <div className="mt-3 space-y-4">
                      <div className="grid gap-2 md:grid-cols-2">
                        <Metric label={t("agent.result.record-id")} value={resultRun.run_id} />
                        <Metric label={t("agent.result.provider-requested")} value={resultRun.provider_requested ?? agentProvider} />
                        <Metric label={t("agent.result.provider-used")} value={resultRun.provider_used ?? "mock"} />
                        <Metric label={t("agent.result.fallback-reason")} value={resultRun.fallback_reason ?? t("agent.result.none")} />
                        <Metric label={t("agent.result.record-type")} value={resultRun.is_simulated ? t("agent.result.demo-record") : t("agent.result.live-record")} />
                        <Metric label={t("agent.result.memory-used")} value={resultRun.memory_used ? t("agent.result.yes") : t("agent.result.no")} />
                      </div>

                      <section className="space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                          {t("agent.result.tool-calls")}
                        </h3>
                        <ToolCallList calls={resultRun.tool_calls} />
                      </section>

                      {trace !== undefined && trace !== null && (
                        <section className="space-y-2">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            {t("agent.result.trace")}
                          </h3>
                          <JsonBlock value={trace} />
                        </section>
                      )}
                    </div>
                  </details>
                </CardContent>
              </Card>
            )}

            <details className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]">
              <summary className="flex cursor-pointer items-start gap-2 px-3 py-3 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)]">
                <TerminalSquare className="mt-0.5 h-4 w-4 text-[var(--text-muted)]" />
                <span>
                  <span className="block text-[var(--text-primary)]">{t("workspace.expert-sql-title")}</span>
                  <span className="mt-0.5 block font-normal text-[var(--text-muted)]">{t("workspace.expert-sql-hint")}</span>
                </span>
              </summary>
              <div className="min-w-0 border-t border-[var(--border-default)] p-4">
                <div className="min-h-[560px] overflow-hidden rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)]">
                  <SqlWorkspacePanel />
                </div>
              </div>
            </details>
          </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <p className="truncate text-xs font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
