"use client";

import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useDataStore } from "@/stores/data-store";
import { useAnalysisStore } from "@/stores/analysis-store";
import { useSqlHistoryStore } from "@/stores/sql-history-store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Upload, Code, MonitorPlay, ArrowRight,
  Database, Zap, BrainCircuit, Clock,
} from "lucide-react";

function timeAgo(dateStr: string, t: (key: string, opts?: Record<string, unknown>) => string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return dateStr;
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t("dashboard.just-now");
  if (minutes < 60) return t("dashboard.minutes-ago", { n: minutes });
  if (hours < 24) return t("dashboard.hours-ago", { n: hours });
  if (days < 7) return t("dashboard.days-ago", { n: days });
  return new Date(dateStr).toLocaleDateString();
}

export default function HomePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const tables = useDataStore((s) => s.tables);
  const runs = useAnalysisStore((s) => s.runs);
  const recentRuns = useMemo(
    () => runs.filter((r) => r.status === "success").slice(-5).reverse(),
    [runs]
  );
  const systemStatus = useDataStore((s) => s.systemStatus);
  const history = useSqlHistoryStore((s) => s.history);
  const recentQueries = useMemo(() => history.slice(0, 5), [history]);

  // Fetch query history on mount
  useEffect(() => {
    useSqlHistoryStore.getState().fetchHistory();
  }, []);

  // Check if status is loaded
  const isStatusLoaded = systemStatus.version !== "...";

  // New user onboarding
  const isNewUser = runs.length === 0 && tables.length === 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          {t("app.title")}
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {t("app.subtitle")}
        </p>
      </div>

      {/* Onboarding for new users */}
      {isNewUser && (
        <Card variant="highlighted">
          <CardHeader>
            <CardTitle>{t("dashboard.get-started")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <p className="text-xs font-medium text-[var(--text-primary)]">{t("dashboard.upload-data")}</p>
                <p className="text-2xs text-[var(--text-muted)] mt-0.5">{t("dashboard.upload-hint")}</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <p className="text-xs font-medium text-[var(--text-primary)]">{t("dashboard.ask-questions")}</p>
                <p className="text-2xs text-[var(--text-muted)] mt-0.5">{t("dashboard.ask-hint")}</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <p className="text-xs font-medium text-[var(--text-primary)]">{t("dashboard.explore-results")}</p>
                <p className="text-2xs text-[var(--text-muted)] mt-0.5">{t("dashboard.explore-hint")}</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button variant="primary" size="lg" onClick={() => router.push("/analyze")} rightIcon={<ArrowRight className="w-4 h-4" />}>
                {t("dashboard.start-analysis")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => router.push("/data")}
          className="flex flex-col items-center gap-2 p-6 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-colors text-left"
        >
          <Upload className="w-6 h-6 text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">{t("nav.data")}</span>
          <span className="text-[10px] text-[var(--text-muted)]">{t("dashboard.data-hint")}</span>
        </button>

        <button
          onClick={() => router.push("/query")}
          className="flex flex-col items-center gap-2 p-6 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-colors text-left"
        >
          <Code className="w-6 h-6 text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">{t("nav.query")}</span>
          <span className="text-[10px] text-[var(--text-muted)]">{t("dashboard.query-hint")}</span>
        </button>

        <button
          onClick={() => router.push("/analyze")}
          className="flex flex-col items-center gap-2 p-6 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-colors text-left"
        >
          <MonitorPlay className="w-6 h-6 text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">{t("nav.analyze")}</span>
          <span className="text-[10px] text-[var(--text-muted)]">{t("dashboard.analyze-hint")}</span>
        </button>
      </div>

      {/* System status */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.system-status")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isStatusLoaded ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[var(--text-muted)]">API: </span>
                <span className={systemStatus.api === "ok" ? "text-green-400" : "text-red-400"}>
                  {systemStatus.api}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">DB: </span>
                <span className={systemStatus.db === "ok" ? "text-green-400" : "text-red-400"}>
                  {systemStatus.db}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Version: </span>
                <span className="text-[var(--text-primary)]">{systemStatus.version}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">{t("dashboard.tables-count")}: </span>
                <span className="text-[var(--text-primary)]">{tables.length}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-[var(--bg-tertiary)] rounded w-3/4" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent analyses */}
      {recentRuns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.recent-analyses")}</CardTitle>
          </CardHeader>
          <CardContent className="!p-0">
            <div className="divide-y divide-[var(--border-default)]">
              {recentRuns.map((run) => (
                <button
                  key={run.id}
                  onClick={() => router.push(`/analyze/${run.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    run.status === "success" ? "bg-green-400" : run.status === "error" ? "bg-red-400" : "bg-yellow-400"
                  }`} />
                  <span className="text-xs text-[var(--text-primary)] truncate flex-1">
                    {run.question || run.table || run.mode}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                    {timeAgo(run.timestamp, t)}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent queries */}
      {recentQueries.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--text-muted)]" />
              <CardTitle>{t("dashboard.recent-queries")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="!p-0">
            <div className="divide-y divide-[var(--border-default)]">
              {recentQueries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => router.push(`/query`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    entry.status === "success" ? "bg-green-400" : "bg-red-400"
                  }`} />
                  <span className="text-xs text-[var(--text-primary)] truncate flex-1 font-mono">
                    {entry.sql.length > 80 ? entry.sql.slice(0, 80) + "..." : entry.sql}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                    {entry.runtimeMs}ms · {entry.rowCount} rows
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick tip for empty state */}
      {tables.length > 0 && runs.length === 0 && (
        <EmptyState
          icon={<Database className="w-8 h-8" />}
          title={t("dashboard.ready-to-analyze")}
          description={t("dashboard.ready-hint", { count: tables.length })}
          action={
            <Button variant="primary" size="md" onClick={() => router.push("/analyze")} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              {t("dashboard.start-btn")}
            </Button>
          }
        />
      )}
    </div>
  );
}
