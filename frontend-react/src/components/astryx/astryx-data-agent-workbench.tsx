"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  BarChart3,
  ChevronDown,
  Database,
  FileSpreadsheet,
  History,
  Languages,
  Lightbulb,
  ListChecks,
  Loader2,
  Moon,
  ShieldAlert,
  Settings,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import {
  createAgentRun,
  fetchQualityReport,
  fetchTableData,
  fetchTables,
  uploadFile,
  type AgentBusinessReport,
  type AgentProviderRequested,
  type AgentRun,
  type BusinessReportItem,
  type LlmProvider,
} from "@/services/api";
import { useDataStore } from "@/stores/data-store";
import { useInvestigationStore } from "@/stores/investigation-store";
import { useAstryxWorkbenchStore, type BusinessAnalysisRecord } from "@/stores/astryx-workbench-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useLanguage } from "@/hooks/use-language";
import { useThemeStore } from "@/hooks/use-theme";
import { SqlWorkspacePanel } from "@/panels/sql-workspace-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea, Select } from "@/components/ui/input";
import { cn } from "@/utils/cn";

type WorkbenchFocus = "workbench" | "upload" | "results" | "history" | "settings" | "expert";

const PROVIDERS: Array<{ value: AgentProviderRequested; label: string }> = [
  { value: "mock", label: "Mock" },
  { value: "doubao", label: "Doubao" },
  { value: "deepseek", label: "DeepSeek" },
  { value: "openai", label: "OpenAI" },
  { value: "mimo", label: "Mimo" },
];

const WORKSPACE_PROVIDERS = new Set<LlmProvider>(["mock", "deepseek", "doubao", "mimo"]);

function stringify(value: unknown): string {
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
  if (Array.isArray(value)) return value.map((item) => stringify(item)).filter(Boolean);
  const text = stringify(value);
  return text ? [text] : [];
}

function toRows(value: unknown): Record<string, unknown>[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object");
  }
  if (typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    const nested = objectValue.data ?? objectValue.rows ?? objectValue.result ?? objectValue.preview;
    if (Array.isArray(nested)) return toRows(nested);
    return [objectValue];
  }
  return [];
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function reportItems(value: unknown): BusinessReportItem[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is BusinessReportItem =>
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean" ||
        isPlainRecord(item)
    );
  }
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    isPlainRecord(value)
  ) {
    return [value];
  }
  return [];
}

function hasBusinessReport(report: AgentBusinessReport | null | undefined): report is AgentBusinessReport {
  if (!report) return false;
  if (typeof report.executive_summary === "string" && report.executive_summary.trim()) return true;
  return [
    report.key_findings,
    report.evidence_summary,
    report.risk_priorities,
    report.recommendations,
    report.next_questions,
    report.limitations,
  ].some((items) => reportItems(items).length > 0);
}

function reportItemTitle(item: BusinessReportItem): string {
  if (!isPlainRecord(item)) return stringify(item);
  const keys = [
    "title",
    "summary",
    "finding",
    "risk_name",
    "recommendation",
    "action",
    "question",
    "limitation",
    "metric",
    "object",
    "target_object",
    "name",
  ];
  for (const key of keys) {
    const value = item[key];
    if (value !== null && value !== undefined && stringify(value).trim()) return stringify(value);
  }
  return Object.entries(item)
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${stringify(value)}`)
    .join(" · ");
}

function reportItemDetails(item: BusinessReportItem): string[] {
  if (!isPlainRecord(item)) return [];
  const detailKeys = [
    "reason",
    "evidence",
    "supporting_evidence",
    "risk_reminder",
    "monitoring_metric",
    "expected_action_window",
    "fallback_message",
    "confidence",
    "score",
  ];
  return detailKeys
    .map((key) => {
      const value = item[key];
      if (value === null || value === undefined || value === "") return "";
      return `${key.replaceAll("_", " ")}: ${stringify(value)}`;
    })
    .filter(Boolean);
}

function riskLevel(item: BusinessReportItem): "high" | "medium" | "low" | "other" {
  if (!isPlainRecord(item)) return "other";
  const raw = stringify(item.risk_level ?? item.level ?? item.priority ?? "").toLowerCase();
  if (raw.includes("high")) return "high";
  if (raw.includes("medium")) return "medium";
  if (raw.includes("low")) return "low";
  return "other";
}

function firstMeaningfulSentence(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  const match = normalized.match(/^(.+?[.!?])\s/);
  return match?.[1] ?? normalized.slice(0, 180);
}

function buildRecord(
  run: AgentRun,
  question: string,
  tableName: string | null,
  responseWarnings: string[],
  nextSteps: string[]
): BusinessAnalysisRecord {
  const answer = run.answer?.trim()
    || firstMeaningfulSentence(run.intent ?? "")
    || "Analysis completed. Review the related data and warnings before making a decision.";
  const findings = [
    ...reportItems(run.business_report?.key_findings).map(reportItemTitle),
    ...toStringList(run.findings),
    ...toStringList(run.key_findings),
    ...(run.intent ? [run.intent] : []),
  ].slice(0, 5);
  const warnings = [...responseWarnings, ...toStringList(run.warnings)].filter(Boolean);
  const evidencePreview = toRows(run.evidence ?? run.result_preview).slice(0, 10);

  return {
    runId: run.run_id,
    question,
    tableName,
    answer,
    businessReport: run.business_report ?? null,
    findings: findings.length > 0 ? findings : [firstMeaningfulSentence(answer)],
    evidencePreview,
    sql: run.sql ?? null,
    warnings,
    nextSteps,
    providerRequested: run.provider_requested ?? null,
    providerUsed: run.provider_used ?? null,
    fallbackTriggered: Boolean(run.fallback_triggered),
    fallbackReason: run.fallback_reason ?? null,
    status: run.status,
    createdAt: new Date().toISOString(),
    rawRun: run,
  };
}

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function AstryxDataAgentWorkbench({ focus = "workbench" }: { focus?: WorkbenchFocus }) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const tables = useDataStore((s) => s.tables);
  const setTables = useDataStore((s) => s.setTables);
  const currentData = useDataStore((s) => s.currentData);
  const currentColumns = useDataStore((s) => s.currentColumns);
  const setCurrentData = useDataStore((s) => s.setCurrentData);
  const qualityReport = useDataStore((s) => s.qualityReport);
  const setQualityReport = useDataStore((s) => s.setQualityReport);
  const uploadedFiles = useDataStore((s) => s.uploadedFiles);
  const setUploadedFiles = useDataStore((s) => s.setUploadedFiles);
  const activeTable = useInvestigationStore((s) => s.activeTable);
  const setActiveTable = useInvestigationStore((s) => s.setActiveTable);
  const storeProvider = useAstryxWorkbenchStore((s) => s.provider);
  const setStoreProvider = useAstryxWorkbenchStore((s) => s.setProvider);
  const records = useAstryxWorkbenchStore((s) => s.records);
  const activeRunId = useAstryxWorkbenchStore((s) => s.activeRunId);
  const setActiveRunId = useAstryxWorkbenchStore((s) => s.setActiveRunId);
  const addRecord = useAstryxWorkbenchStore((s) => s.addRecord);
  const llmProvider = useWorkspaceStore((s) => s.llmProvider);
  const setLlmProvider = useWorkspaceStore((s) => s.setLlmProvider);
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useThemeStore();

  const [question, setQuestion] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(focus === "history" || focus === "results");
  const [settingsOpen, setSettingsOpen] = useState(focus === "settings");

  const tableName = activeTable || tables[0]?.name || null;
  const currentTable = tables.find((table) => table.name === tableName);
  const activeRecord = records.find((record) => record.runId === activeRunId) ?? records[0] ?? null;
  const provider = storeProvider || "mock";
  const initialExpertOpen = focus === "expert";
  const nextSteps = useMemo(
    () => [
      t("astryx.next.month"),
      t("astryx.next.risk"),
      t("astryx.next.export"),
    ],
    [t]
  );
  const examples = useMemo(
    () => [
      t("astryx.example.region"),
      t("astryx.example.top"),
      t("astryx.example.refund"),
      t("astryx.example.even"),
    ],
    [t]
  );

  useEffect(() => {
    if (!storeProvider && llmProvider) setStoreProvider(llmProvider);
  }, [llmProvider, setStoreProvider, storeProvider]);

  useEffect(() => {
    if (focus === "history" || focus === "results") setHistoryOpen(true);
    if (focus === "settings") setSettingsOpen(true);
  }, [focus]);

  const refreshTables = useCallback(async () => {
    const nextTables = await fetchTables();
    setTables(nextTables);
    if (!tableName && nextTables.length > 0) setActiveTable(nextTables[0].name);
  }, [setActiveTable, setTables, tableName]);

  useEffect(() => {
    if (tables.length > 0 && !tableName) setActiveTable(tables[0].name);
  }, [setActiveTable, tableName, tables]);

  const loadTableContext = useCallback(async (name: string) => {
    setError(null);
    setActiveTable(name);
    try {
      const [preview, quality] = await Promise.all([
        fetchTableData(name, 10),
        fetchQualityReport(name).catch(() => null),
      ]);
      setCurrentData(preview.data, preview.columns);
      setQualityReport(quality, name);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t("astryx.error.table-load"));
    }
  }, [setActiveTable, setCurrentData, setQualityReport, t]);

  const handleFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const uploaded = await uploadFile(file);
      setUploadedFiles([
        {
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type || "spreadsheet",
          uploadedAt: new Date().toISOString(),
          tableName: uploaded.tableName,
          rowCount: uploaded.rowCount,
          columnCount: uploaded.columnCount,
          status: "success",
        },
        ...uploadedFiles,
      ]);
      await refreshTables();
      await loadTableContext(uploaded.tableName);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : t("astryx.error.upload"));
    } finally {
      setIsUploading(false);
    }
  }, [loadTableContext, refreshTables, setUploadedFiles, t, uploadedFiles]);

  const updateProvider = useCallback((nextProvider: AgentProviderRequested) => {
    setStoreProvider(nextProvider);
    if (WORKSPACE_PROVIDERS.has(nextProvider as LlmProvider)) {
      setLlmProvider(nextProvider as LlmProvider);
    }
  }, [setLlmProvider, setStoreProvider]);

  const handleAnalyze = useCallback(async () => {
    const trimmed = question.trim();
    if (!trimmed) {
      setError(t("astryx.error.question"));
      return;
    }
    if (!tableName) {
      setError(t("astryx.error.no-table"));
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await createAgentRun({
        user_input: trimmed,
        table_name: tableName,
        provider_requested: provider,
        mode: "skeleton",
      });
      const record = buildRecord(response.run, trimmed, tableName, toStringList(response.warnings), nextSteps);
      addRecord(record);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : t("astryx.error.analysis"));
    } finally {
      setIsAnalyzing(false);
    }
  }, [addRecord, nextSteps, provider, question, tableName, t]);

  return (
    <div data-astryx-workbench className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_34%),var(--bg-primary)]">
      <header className="sticky top-0 z-30 border-b border-[var(--astryx-line)] bg-[var(--bg-primary)]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-subtle)] text-sm font-bold text-[var(--accent)]">
              EAI
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{t("astryx.app-title")}</p>
              <p className="truncate text-xs text-[var(--text-muted)]">
                {t("astryx.header.table")}: {currentTable?.name ?? t("astryx.empty.table")}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setHistoryOpen(true)} leftIcon={<History className="h-3.5 w-3.5" />}>
              {t("astryx.history.button")}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setSettingsOpen(true)} leftIcon={<Settings className="h-3.5 w-3.5" />}>
              {t("astryx.settings.button")}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={toggleLanguage} leftIcon={<Languages className="h-3.5 w-3.5" />}>
              {t(language === "zh" ? "astryx.language.en" : "astryx.language.zh")}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-6 lg:px-8">
        <section className="grid gap-5 rounded-2xl border border-[var(--astryx-line)] bg-[var(--astryx-panel)] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <Badge variant="accent" size="md">{t("astryx.brand-pill")}</Badge>
            <div className="max-w-3xl space-y-3">
              <h1 className="text-2xl font-semibold leading-tight text-[var(--text-primary)] md:text-3xl">
                {t("astryx.hero.title")}
              </h1>
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                {t("astryx.hero.subtitle")}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <StatusTile icon={<FileSpreadsheet className="h-4 w-4" />} label={t("astryx.metric.table")} value={currentTable?.name ?? t("astryx.empty.table")} />
            <StatusTile icon={<Database className="h-4 w-4" />} label={t("astryx.metric.rows")} value={currentTable ? currentTable.rowCount.toLocaleString() : "0"} />
            <StatusTile icon={<BarChart3 className="h-4 w-4" />} label={t("astryx.metric.records")} value={records.length.toLocaleString()} />
          </div>
        </section>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-[var(--error)]/30 bg-[var(--danger-subtle)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--error)]" />
            <span>{error}</span>
          </div>
        )}

        <main className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <section className="space-y-4">
            <Panel title={t("astryx.data.title")} icon={<Upload className="h-4 w-4" />}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleFile(file);
                  event.currentTarget.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-[var(--astryx-line)] bg-[var(--astryx-soft)] px-4 py-6 text-center transition-colors hover:border-[var(--accent)]"
              >
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
                ) : (
                  <FileSpreadsheet className="h-7 w-7 text-[var(--accent)]" />
                )}
                <span className="mt-3 text-sm font-medium text-[var(--text-primary)]">{t("astryx.data.drop-title")}</span>
                <span className="mt-1 text-xs text-[var(--text-muted)]">{t("astryx.data.drop-desc")}</span>
              </button>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--text-muted)]">{t("astryx.data.current")}</label>
                {tables.length > 0 ? (
                  <Select
                    value={tableName ?? ""}
                    onChange={(event) => void loadTableContext(event.target.value)}
                  >
                    {tables.map((table) => (
                      <option key={table.name} value={table.name}>
                        {table.name} ({table.rowCount.toLocaleString()})
                      </option>
                    ))}
                  </Select>
                ) : (
                  <p className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-xs text-[var(--text-muted)]">
                    {t("astryx.data.empty")}
                  </p>
                )}
              </div>

              {currentTable && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <MiniStat label={t("astryx.data.columns")} value={currentTable.columnCount.toLocaleString()} />
                  <MiniStat label={t("astryx.data.rows")} value={currentTable.rowCount.toLocaleString()} />
                </div>
              )}

              <QualitySummary score={qualityReport?.overallScore ?? null} warnings={qualityReport?.warnings ?? []} />
            </Panel>
          </section>

          <section className="space-y-5">
            <Panel title={t("astryx.ask.title")} icon={<Sparkles className="h-4 w-4" />}>
              <div className="space-y-4">
                <Textarea
                  id="astryx-question"
                  value={question}
                  disabled={isAnalyzing}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder={t("astryx.ask.placeholder")}
                  rows={5}
                  className="min-h-[132px] !resize-none !rounded-xl !text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  {examples.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setQuestion(example)}
                      className="rounded-full border border-[var(--border-default)] px-3 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      {example}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-3 border-t border-[var(--border-default)] pt-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <p className="text-xs leading-5 text-[var(--text-muted)]">{t("astryx.ask.helper")}</p>
                    <Select
                      value={provider}
                      onChange={(event) => updateProvider(event.target.value)}
                      className="max-w-[150px] !py-1"
                      aria-label={t("astryx.settings.provider")}
                    >
                      {PROVIDERS.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    loading={isAnalyzing}
                    disabled={isAnalyzing || !question.trim() || !tableName}
                    onClick={handleAnalyze}
                    leftIcon={<Sparkles className="h-4 w-4" />}
                  >
                    {isAnalyzing ? t("astryx.ask.running") : t("astryx.ask.submit")}
                  </Button>
                </div>
              </div>
            </Panel>

            <BusinessResult record={activeRecord} rows={currentData ?? []} columns={currentColumns} />

            <Panel title={t("astryx.expert.title")} icon={<Database className="h-4 w-4" />} defaultOpen={initialExpertOpen}>
              <p className="mb-3 text-xs leading-5 text-[var(--text-muted)]">{t("astryx.expert.desc")}</p>
              <div className="min-h-[560px] overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)]">
                <SqlWorkspacePanel />
              </div>
            </Panel>
          </section>
        </main>
      </div>

      <WorkbenchDrawer
        open={historyOpen}
        title={t("astryx.history.title")}
        icon={<History className="h-4 w-4" />}
        onClose={() => setHistoryOpen(false)}
      >
        <HistoryList
          records={records}
          activeRunId={activeRecord?.runId ?? null}
          onSelect={(runId) => {
            setActiveRunId(runId);
            setHistoryOpen(false);
          }}
        />
      </WorkbenchDrawer>

      <WorkbenchDrawer
        open={settingsOpen}
        title={t("astryx.settings.title")}
        icon={<Settings className="h-4 w-4" />}
        onClose={() => setSettingsOpen(false)}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)]">{t("astryx.settings.provider")}</label>
            <Select value={provider} onChange={(event) => updateProvider(event.target.value)}>
              {PROVIDERS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </Select>
            <p className="text-xs leading-5 text-[var(--text-muted)]">{t("astryx.settings.provider-hint")}</p>
          </div>
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-3">
            <p className="text-xs font-medium text-[var(--text-primary)]">{t("astryx.settings.fallback")}</p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{t("astryx.settings.fallback-desc")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={toggleLanguage} leftIcon={<Languages className="h-3.5 w-3.5" />}>
              {t(language === "zh" ? "astryx.language.en" : "astryx.language.zh")}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={toggleTheme} leftIcon={<Moon className="h-3.5 w-3.5" />}>
              {theme === "dark" ? t("astryx.settings.light") : t("astryx.settings.dark")}
            </Button>
          </div>
        </div>
      </WorkbenchDrawer>
    </div>
  );
}

function WorkbenchDrawer({
  open,
  title,
  icon,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  icon: ReactNode;
  children: ReactNode;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label={t("astryx.drawer.close")}
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />
      <section className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[var(--astryx-line)] bg-[var(--bg-secondary)] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--astryx-line)] px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <span className="text-[var(--accent)]">{icon}</span>
            {title}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label={t("astryx.drawer.close")}
            leftIcon={<X className="h-3.5 w-3.5" />}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </section>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="rounded-2xl border border-[var(--astryx-line)] bg-[var(--astryx-panel-strong)] shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
    >
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <span className="text-[var(--accent)]">{icon}</span>
          {title}
        </span>
        <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
      </summary>
      <div className="space-y-4 border-t border-[var(--astryx-line)] px-4 py-4">
        {children}
      </div>
    </details>
  );
}

function StatusTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-3">
      <div className="flex items-center gap-2 text-[var(--text-muted)]">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 truncate text-sm font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function QualitySummary({ score, warnings }: { score: number | null; warnings: string[] }) {
  const { t } = useTranslation();
  if (score === null && warnings.length === 0) {
    return <p className="text-xs leading-5 text-[var(--text-muted)]">{t("astryx.quality.empty")}</p>;
  }

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-[var(--text-muted)]">{t("astryx.quality.title")}</span>
        {score !== null && <Badge variant={score >= 80 ? "success" : score >= 60 ? "warning" : "error"}>{score}</Badge>}
      </div>
      {warnings.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs leading-5 text-[var(--text-muted)]">
          {warnings.slice(0, 3).map((warning, index) => (
            <li key={`${warning}-${index}`}>{warning}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function BusinessResult({
  record,
  rows,
  columns,
}: {
  record: BusinessAnalysisRecord | null;
  rows: Record<string, unknown>[];
  columns: string[];
}) {
  const { t } = useTranslation();
  const [technicalOpen, setTechnicalOpen] = useState(false);
  if (!record) {
    return (
      <Panel title={t("astryx.result.title")} icon={<BarChart3 className="h-4 w-4" />}>
        <div className="rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-8 text-center">
          <p className="text-sm font-medium text-[var(--text-primary)]">{t("astryx.result.empty-title")}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{t("astryx.result.empty-desc")}</p>
        </div>
      </Panel>
    );
  }

  const previewRows = record.evidencePreview.length > 0 ? record.evidencePreview : rows.slice(0, 5);
  const previewColumns = previewRows.length > 0
    ? Object.keys(previewRows[0]).slice(0, 6)
    : columns.slice(0, 6);
  const businessReport = hasBusinessReport(record.businessReport) ? record.businessReport : null;

  return (
    <Panel title={t("astryx.result.title")} icon={<BarChart3 className="h-4 w-4" />}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={record.status === "completed" ? "success" : record.status === "failed" ? "error" : "muted"}>
            {record.status === "completed" ? t("astryx.status.completed") : record.status}
          </Badge>
          {record.fallbackTriggered && <Badge variant="warning">{t("astryx.status.demo")}</Badge>}
          <span className="text-xs text-[var(--text-muted)]">{formatDate(record.createdAt)}</span>
        </div>

        {businessReport ? (
          <BusinessReportView report={businessReport} />
        ) : (
          <LegacyAnswerView record={record} />
        )}

        <section className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">{t("astryx.result.data")}</p>
          {previewRows.length > 0 && previewColumns.length > 0 ? (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-default)] text-[var(--text-muted)]">
                    {previewColumns.map((column) => (
                      <th key={column} className="px-2 py-2 font-medium">{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.slice(0, 8).map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-[var(--border-default)]/60 last:border-0">
                      {previewColumns.map((column) => (
                        <td key={column} className="max-w-[220px] truncate px-2 py-2 text-[var(--text-secondary)]">
                          {stringify(row[column]) || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--text-muted)]">{t("astryx.result.no-data")}</p>
          )}
        </section>

        {record.warnings.length > 0 && (
          <section className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning-subtle)] px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--warning)]">{t("astryx.result.warnings")}</p>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-[var(--text-secondary)]">
              {record.warnings.map((warning, index) => (
                <li key={`${warning}-${index}`}>{warning}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)]">
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-sm font-medium text-[var(--text-primary)]"
            onClick={() => setTechnicalOpen((open) => !open)}
            aria-expanded={technicalOpen}
          >
            {t("astryx.result.technical")}
            <ChevronDown className={cn("h-4 w-4 text-[var(--text-muted)] transition-transform", technicalOpen && "rotate-180")} />
          </button>
          {technicalOpen && (
            <div className="space-y-3 border-t border-[var(--border-default)] p-4 text-xs text-[var(--text-secondary)]">
              <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3">
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{t("astryx.result.sql")}</p>
                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-xs leading-5 text-[var(--text-secondary)]">
                  {record.sql || t("astryx.result.no-sql")}
                </pre>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <MiniStat label={t("astryx.result.provider-requested")} value={record.providerRequested ?? "-"} />
                <MiniStat label={t("astryx.result.provider-used")} value={record.providerUsed ?? "-"} />
                <MiniStat label={t("astryx.result.fallback-reason")} value={record.fallbackReason ?? t("astryx.result.none")} />
                <MiniStat label={t("astryx.result.record")} value={record.runId} />
              </div>
              <pre className="max-h-72 overflow-auto rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3">
                {JSON.stringify(
                  {
                    tool_calls: record.rawRun.tool_calls ?? [],
                    trace: record.rawRun.trace ?? null,
                    memory_used: record.rawRun.memory_used ?? false,
                    raw: record.rawRun,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </section>
      </div>
    </Panel>
  );
}

function BusinessReportView({ report }: { report: AgentBusinessReport }) {
  const { t } = useTranslation();
  const findings = reportItems(report.key_findings);
  const evidence = reportItems(report.evidence_summary);
  const risks = reportItems(report.risk_priorities);
  const recommendations = reportItems(report.recommendations);
  const nextQuestions = reportItems(report.next_questions);
  const limitations = reportItems(report.limitations);

  return (
    <div className="space-y-4" data-testid="business-report-view">
      {report.executive_summary && (
        <section className="rounded-xl border border-[var(--accent)]/35 bg-[var(--accent-subtle)] px-4 py-4">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--accent)]">
            <Sparkles className="h-3.5 w-3.5" />
            {t("astryx.result.executive-summary")}
          </p>
          <p className="mt-3 whitespace-pre-wrap text-base font-semibold leading-7 text-[var(--text-primary)]">
            {report.executive_summary}
          </p>
        </section>
      )}

      {findings.length > 0 && (
        <ReportListSection
          title={t("astryx.result.key-findings")}
          icon={<ListChecks className="h-3.5 w-3.5" />}
          items={findings}
          accent="accent"
        />
      )}

      {evidence.length > 0 && (
        <ReportListSection
          title={t("astryx.result.evidence-summary")}
          icon={<BarChart3 className="h-3.5 w-3.5" />}
          items={evidence}
          accent="muted"
          grid
        />
      )}

      {risks.length > 0 && <RiskPriorityPanel risks={risks} />}

      {recommendations.length > 0 && (
        <ReportListSection
          title={t("astryx.result.recommendations")}
          icon={<Lightbulb className="h-3.5 w-3.5" />}
          items={recommendations}
          accent="success"
        />
      )}

      {limitations.length > 0 && (
        <ReportListSection
          title={t("astryx.result.limitations")}
          icon={<ShieldAlert className="h-3.5 w-3.5" />}
          items={limitations}
          accent="warning"
        />
      )}

      {nextQuestions.length > 0 && (
        <section className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">{t("astryx.result.next-questions")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {nextQuestions.map((item, index) => (
              <button
                key={`${reportItemTitle(item)}-${index}`}
                type="button"
                className="rounded-full border border-[var(--border-default)] px-3 py-1.5 text-xs text-[var(--text-secondary)]"
              >
                {reportItemTitle(item)}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function LegacyAnswerView({ record }: { record: BusinessAnalysisRecord }) {
  const { t } = useTranslation();
  return (
    <>
      <section className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--accent)]">{t("astryx.result.answer")}</p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--text-primary)]">{record.answer}</p>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">{t("astryx.result.findings")}</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
            {record.findings.slice(0, 5).map((finding, index) => (
              <li key={`${finding}-${index}`} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">{t("astryx.result.next")}</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
            {record.nextSteps.map((step) => (
              <li key={step} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

function ReportListSection({
  title,
  icon,
  items,
  accent,
  grid = false,
}: {
  title: string;
  icon: ReactNode;
  items: BusinessReportItem[];
  accent: "accent" | "muted" | "success" | "warning";
  grid?: boolean;
}) {
  const color = accent === "accent"
    ? "text-[var(--accent)]"
    : accent === "success"
      ? "text-[var(--success)]"
      : accent === "warning"
        ? "text-[var(--warning)]"
        : "text-[var(--text-muted)]";
  return (
    <section className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-4">
      <p className={cn("flex items-center gap-2 text-xs font-medium uppercase tracking-wider", color)}>
        {icon}
        {title}
      </p>
      <ul className={cn("mt-3 gap-3", grid ? "grid md:grid-cols-2" : "space-y-3")}>
        {items.map((item, index) => (
          <li key={`${reportItemTitle(item)}-${index}`} className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-3">
            <p className="text-sm font-medium leading-6 text-[var(--text-primary)]">{reportItemTitle(item)}</p>
            {reportItemDetails(item).length > 0 && (
              <ul className="mt-2 space-y-1 text-xs leading-5 text-[var(--text-muted)]">
                {reportItemDetails(item).slice(0, 3).map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function RiskPriorityPanel({ risks }: { risks: BusinessReportItem[] }) {
  const { t } = useTranslation();
  const grouped = {
    high: risks.filter((item) => riskLevel(item) === "high"),
    medium: risks.filter((item) => riskLevel(item) === "medium"),
    low: risks.filter((item) => riskLevel(item) === "low"),
    other: risks.filter((item) => riskLevel(item) === "other"),
  };
  type RiskGroupKey = keyof typeof grouped;
  const riskGroups: Array<{ key: RiskGroupKey; label: string; tone: string }> = [
    { key: "high", label: t("astryx.result.risk-high"), tone: "text-[var(--error)]" },
    { key: "medium", label: t("astryx.result.risk-medium"), tone: "text-[var(--warning)]" },
    { key: "low", label: t("astryx.result.risk-low"), tone: "text-[var(--success)]" },
    { key: "other", label: t("astryx.result.risk-other"), tone: "text-[var(--text-muted)]" },
  ];
  const groups = riskGroups.filter((group) => grouped[group.key].length > 0);

  return (
    <section className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-4">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--warning)]">
        <ShieldAlert className="h-3.5 w-3.5" />
        {t("astryx.result.risk-priorities")}
      </p>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {groups.map((group) => (
          <div key={group.key} className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-3">
            <p className={cn("text-xs font-semibold uppercase tracking-wider", group.tone)}>{group.label}</p>
            <ul className="mt-2 space-y-2">
              {grouped[group.key].map((risk, index) => (
                <li key={`${reportItemTitle(risk)}-${index}`} className="text-sm leading-6 text-[var(--text-secondary)]">
                  {reportItemTitle(risk)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function HistoryList({
  records,
  activeRunId,
  onSelect,
}: {
  records: BusinessAnalysisRecord[];
  activeRunId: string | null;
  onSelect: (runId: string) => void;
}) {
  const { t } = useTranslation();
  if (records.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">{t("astryx.history.empty")}</p>;
  }

  return (
    <div className="grid gap-2">
      {records.slice(0, 12).map((record) => (
        <button
          key={record.runId}
          type="button"
          onClick={() => onSelect(record.runId)}
          className={cn(
            "rounded-xl border px-3 py-3 text-left transition-colors",
            activeRunId === record.runId
              ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
              : "border-[var(--border-default)] bg-[var(--bg-primary)] hover:border-[var(--accent)]"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">{record.question}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {record.tableName ?? t("astryx.empty.table")} · {formatDate(record.createdAt)}
              </p>
            </div>
            <Badge variant={record.status === "completed" ? "success" : record.status === "failed" ? "error" : "muted"}>
              {record.status === "completed" ? t("astryx.status.completed") : record.status}
            </Badge>
          </div>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]">{record.answer}</p>
        </button>
      ))}
    </div>
  );
}
