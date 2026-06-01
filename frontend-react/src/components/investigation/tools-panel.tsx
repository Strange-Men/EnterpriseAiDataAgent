"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useSqlEditorStore } from "@/stores/sql-editor-store";
import { useInvestigationStore } from "@/stores/investigation-store";
import { useAnalysisStore } from "@/stores/analysis-store";
import { executeQuery } from "@/services/api";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ToolsPanel() {
  const { t } = useTranslation();
  const router = useRouter();
  const activeTable = useInvestigationStore((s) => s.activeTable);
  const lastSql = useInvestigationStore((s) => s.lastSql);
  const allRuns = useAnalysisStore((s) => s.runs);
  const runs = useMemo(() => allRuns.slice(-5).reverse(), [allRuns]);
  const activeRunId = useAnalysisStore((s) => s.activeRunId);
  const setActiveRun = useAnalysisStore((s) => s.setActiveRun);

  const [sql, setSql] = useState(
    activeTable
      ? `SELECT * FROM "${activeTable}" LIMIT 10;`
      : lastSql ?? ""
  );
  const [sqlResult, setSqlResult] = useState<string | null>(null);
  const [sqlLoading, setSqlLoading] = useState(false);

  const handleRunSql = useCallback(async () => {
    if (!sql.trim() || sqlLoading) return;
    setSqlLoading(true);
    setSqlResult(null);
    try {
      const result = await executeQuery(sql);
      setSqlResult(`${result.data.length} rows · ${result.columns.length} cols`);
    } catch (err) {
      setSqlResult(err instanceof Error ? err.message : "Query failed");
    } finally {
      setSqlLoading(false);
    }
  }, [sql, sqlLoading]);

  const handleRunClick = useCallback((runId: string) => {
    setActiveRun(runId);
    router.push(`/analyze/${runId}`);
  }, [router, setActiveRun]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-[var(--border-default)]">
        <h3 className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          {t("inv.tools.title")}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-3">
        {/* Quick SQL */}
        <div>
          <h4 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
            {t("inv.quick-sql")}
          </h4>
          <Textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            rows={3}
            className="!text-xs !font-mono !px-2 !py-1.5 !resize-none"
            placeholder={t("inv.quick-sql-placeholder", { table: activeTable ?? "table" })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleRunSql();
              }
            }}
          />
          <div className="flex items-center justify-between mt-1.5">
            <Button
              onClick={handleRunSql}
              disabled={sqlLoading || !sql.trim()}
              variant="primary"
              size="sm"
              loading={sqlLoading}
            >
              {sqlLoading ? t("sql.running") : t("inv.run-sql")}
            </Button>
            {sqlResult && (
              <span className="text-[10px] text-[var(--text-muted)]">{sqlResult}</span>
            )}
          </div>
        </div>

        {/* Recent runs */}
        <div>
          <h4 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
            {t("inv.recent-runs")}
          </h4>
          {runs.length === 0 ? (
            <p className="text-[10px] text-[var(--text-muted)] italic">{t("inv.no-recent-runs")}</p>
          ) : (
            <div className="space-y-0.5">
              {runs.map((run) => (
                <button
                  key={run.id}
                  onClick={() => handleRunClick(run.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left text-[10px] transition-colors ${
                    run.id === activeRunId
                      ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    run.status === "success" ? "bg-green-400" : run.status === "error" ? "bg-red-400" : "bg-yellow-400"
                  }`} />
                  <span className="truncate flex-1">
                    {run.question || run.table || run.mode}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
