"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useDataStore } from "@/stores/data-store";
import { useAnalysisStore } from "@/stores/analysis-store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Upload, Code, MonitorPlay, ArrowRight,
  Database, Zap, BrainCircuit,
} from "lucide-react";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function HomePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const tables = useDataStore((s) => s.tables);
  const runs = useAnalysisStore((s) => s.runs);
  const allRuns = useAnalysisStore((s) => s.runs);
  const recentRuns = useMemo(
    () => allRuns.filter((r) => r.status === "success").slice(-5).reverse(),
    [allRuns]
  );
  const systemStatus = useDataStore((s) => s.systemStatus);

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
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <p className="text-xs font-medium text-[var(--text-primary)]">1. Upload Data</p>
                <p className="text-2xs text-[var(--text-muted)] mt-0.5">Start by uploading a CSV or Excel file to analyze</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <p className="text-xs font-medium text-[var(--text-primary)]">2. Ask Questions</p>
                <p className="text-2xs text-[var(--text-muted)] mt-0.5">Ask AI to analyze your data in plain language</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <p className="text-xs font-medium text-[var(--text-primary)]">3. Explore Results</p>
                <p className="text-2xs text-[var(--text-muted)] mt-0.5">Get insights, charts, SQL, and drill-down investigations</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button variant="primary" size="lg" onClick={() => router.push("/analyze")} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Your First Analysis
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
          <span className="text-[10px] text-[var(--text-muted)]">Upload & manage datasets</span>
        </button>

        <button
          onClick={() => router.push("/query")}
          className="flex flex-col items-center gap-2 p-6 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-colors text-left"
        >
          <Code className="w-6 h-6 text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">{t("nav.query")}</span>
          <span className="text-[10px] text-[var(--text-muted)]">Write & execute SQL queries</span>
        </button>

        <button
          onClick={() => router.push("/analyze")}
          className="flex flex-col items-center gap-2 p-6 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-colors text-left"
        >
          <MonitorPlay className="w-6 h-6 text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">{t("nav.analyze")}</span>
          <span className="text-[10px] text-[var(--text-muted)]">AI-powered data analysis</span>
        </button>
      </div>

      {/* System status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
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
              <span className="text-[var(--text-muted)]">Tables: </span>
              <span className="text-[var(--text-primary)]">{tables.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent analyses */}
      {recentRuns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
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
                    {timeAgo(run.timestamp)}
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
          title="Ready to analyze"
          description={`You have ${tables.length} table${tables.length > 1 ? "s" : ""}. Try asking an AI-powered question.`}
          action={
            <Button variant="primary" size="md" onClick={() => router.push("/analyze")} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Start Analysis
            </Button>
          }
        />
      )}
    </div>
  );
}
