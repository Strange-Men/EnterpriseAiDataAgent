"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useDataStore } from "@/stores/data-store";
import { Upload, MonitorPlay, ArrowRight, Info } from "lucide-react";

export default function HomePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const tables = useDataStore((s) => s.tables);
  const systemStatus = useDataStore((s) => s.systemStatus);
  const tableSummary = useMemo(() => tables.reduce((sum, table) => sum + table.rowCount, 0), [tables]);
  const isStatusLoaded = systemStatus.version !== "...";

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <section className="space-y-5 py-5">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            {t("home.eyebrow")}
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-[var(--text-primary)]">
            {t("home.hero-title")}
          </h2>
          <p className="text-sm leading-6 text-[var(--text-muted)]">
            {t("home.hero-subtitle")}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          onClick={() => router.push("/data")}
          className="group flex items-center gap-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-5 text-left transition-all hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 transition-colors group-hover:bg-[var(--accent)]/15">
            <Upload className="h-5 w-5 text-[var(--text-muted)] transition-colors group-hover:text-[var(--accent)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{t("home.upload-data")}</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">{t("home.upload-hint")}</p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-[var(--accent)] transition-transform group-hover:translate-x-0.5" />
        </button>

        <button
          onClick={() => router.push("/analyze")}
          className="group flex items-center gap-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-5 text-left transition-all hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10">
            <MonitorPlay className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{t("home.start-analysis")}</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">{t("home.start-analysis-hint")}</p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
        </button>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
        <p className="text-xs leading-5 text-[var(--text-muted)]">
          {t("home.deploy-notice")}
        </p>
      </div>

      {isStatusLoaded && (
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[var(--text-muted)]">
          <span>
            API: <span className={systemStatus.api === "ok" ? "text-indigo-300" : "text-red-300"}>{systemStatus.api}</span>
          </span>
          <span>
            DB: <span className={systemStatus.db === "ok" ? "text-indigo-300" : "text-red-300"}>{systemStatus.db}</span>
          </span>
          <span>
            {t("dashboard.tables-count")}: <span className="text-[var(--text-primary)]">{tables.length}</span>
          </span>
          <span>
            {t("home.rows-ready")}: <span className="text-[var(--text-primary)]">{tableSummary.toLocaleString()}</span>
          </span>
        </div>
      )}
    </div>
  );
}
