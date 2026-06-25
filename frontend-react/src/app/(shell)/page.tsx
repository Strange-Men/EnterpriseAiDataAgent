"use client";

import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useDataStore } from "@/stores/data-store";
import { formatLocalDate } from "@/utils/datetime";
import { useAnalysisStore } from "@/stores/analysis-store";
import { useSqlHistoryStore } from "@/stores/sql-history-store";
import { useSqlEditorStore } from "@/stores/sql-editor-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Upload, MonitorPlay, ArrowRight,
  Clock, Info,
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
  return formatLocalDate(new Date(dateStr));
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

  useEffect(() => {
    useSqlHistoryStore.getState().fetchHistory();
  }, []);

  const isStatusLoaded = systemStatus.version !== "...";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3 py-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          {t("home.hero-title")}
        </h2>
        <p className="text-sm text-[var(--text-muted)] max-w-2xl mx-auto">
          {t("home.hero-subtitle")}
        </p>
      </div>

      {/* Quick Start — 2 primary CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => router.push("/data")}
          className="group flex items-center gap-4 p-5 rounded-lg border-2 border-[var(--accent)] bg-[var(--accent)]/5 hover:bg-[var(--accent)]/10 transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--accent)]/15 flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{t("home.upload-data")}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{t("home.upload-hint")}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--accent)] shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={() => router.push("/analyze")}
          className="group flex items-center gap-4 p-5 rounded-lg border-2 border-[var(--border-default)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
            <MonitorPlay className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{t("home.start-analysis")}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{t("home.start-analysis-hint")}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--text-muted)] shrink-0 group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* Deployment Notice */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-default)]">
        <Info className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--text-muted)]">
          {t("home.deploy-notice")}
        </p>
      </div>

      {/* System status (compact) */}
      {isStatusLoaded && (
        <div className="flex items-center justify-center gap-6 text-xs text-[var(--text-muted)]">
          <span>
            API: <span className={systemStatus.api === "ok" ? "text-green-400" : "text-red-400"}>{systemStatus.api}</span>
          </span>
          <span>
            DB: <span className={systemStatus.db === "ok" ? "text-green-400" : "text-red-400"}>{systemStatus.db}</span>
          </span>
          <span>
            {t("dashboard.tables-count")}: <span className="text-[var(--text-primary)]">{tables.length}</span>
          </span>
        </div>
      )}

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
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-tertiary)] transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    run.status === "success" ? "bg-green-400" : run.status === "error" ? "bg-red-400" : "bg-yellow-400"
                  }`} />
                  <span className="text-xs text-[var(--text-primary)] truncate flex-1">
                    {run.question || run.table || run.mode}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] shrink-0">
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
                  onClick={() => {
                    // Load SQL into editor tab, then navigate to analysis workspace
                    useSqlEditorStore.getState().addTab(undefined, entry.sql);
                    router.push("/analyze");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-tertiary)] transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    entry.status === "success" ? "bg-green-400" : "bg-red-400"
                  }`} />
                  <span className="text-xs text-[var(--text-primary)] truncate flex-1 font-mono">
                    {entry.sql.length > 80 ? entry.sql.slice(0, 80) + "..." : entry.sql}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] shrink-0">
                    {entry.runtimeMs}ms · {entry.rowCount} rows
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
