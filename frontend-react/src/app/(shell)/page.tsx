"use client";

import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useDataStore } from "@/stores/data-store";
import { useAnalysisStore } from "@/stores/analysis-store";
import { useSqlHistoryStore } from "@/stores/sql-history-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Upload, MonitorPlay, ArrowRight,
  Database, Clock, AlertCircle,
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

      {/* Quick Start — 2 primary actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => router.push("/data")}
          className="group flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-[var(--border-default)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-colors">
            <Upload className="w-6 h-6 text-[var(--accent)]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{t("home.upload-data")}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{t("home.upload-hint")}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
        </button>

        <button
          onClick={() => router.push("/analyze")}
          className="group flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-[var(--accent)]/30 bg-[var(--bg-secondary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-colors">
            <MonitorPlay className="w-6 h-6 text-[var(--accent)]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{t("home.start-ai")}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{t("home.start-ai-hint")}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
        </button>
      </div>

      {/* Demo Flow — 4 steps */}
      <Card>
        <CardHeader>
          <CardTitle>{t("home.demo-flow-title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { step: "1", label: t("home.step-upload"), icon: <Upload className="w-4 h-4" /> },
              { step: "2", label: t("home.step-preview"), icon: <Database className="w-4 h-4" /> },
              { step: "3", label: t("home.step-query"), icon: <MonitorPlay className="w-4 h-4" /> },
              { step: "4", label: t("home.step-insights"), icon: <MonitorPlay className="w-4 h-4" /> },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center gap-2 p-3">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-sm font-bold">
                  {item.step}
                </div>
                <span className="text-xs text-[var(--text-primary)]">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Notice */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-default)]">
        <AlertCircle className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
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
                  onClick={() => router.push(`/analyze`)}
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
    </div>
  );
}
