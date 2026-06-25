"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useDataStore } from "@/stores/data-store";
import { useInvestigationStore } from "@/stores/investigation-store";
import { TabGroup } from "@/components/ui/tab-group";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchTableSchema } from "@/services/api";

interface SchemaCol {
  name: string;
  dtype: string;
  nullable: boolean;
  uniqueCount: number;
}

export function DataPreviewPanel() {
  const { t } = useTranslation();
  const { currentData, currentColumns, qualityReport } = useDataStore();
  const activeTable = useInvestigationStore((s) => s.activeTable);
  const [schema, setSchema] = useState<SchemaCol[]>([]);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!activeTable) {
      setSchema([]);
      return;
    }
    setSchemaLoading(true);
    fetchTableSchema(activeTable)
      .then((data) => { if (mountedRef.current) setSchema(data); })
      .catch(() => { if (mountedRef.current) setSchema([]); })
      .finally(() => { if (mountedRef.current) setSchemaLoading(false); });
  }, [activeTable]);

  if (!activeTable) {
    return (
      <EmptyState
        icon="📋"
        title={t("preview.no-data")}
        description={t("preview.no-data-loaded")}
      />
    );
  }

  if (!currentData || currentData.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title={t("preview.no-data")}
        description={t("preview.no-data-loaded")}
      />
    );
  }

  const tabs = [
    {
      id: "preview",
      label: t("preview.tab-preview"),
      content: <PreviewTab data={currentData} columns={currentColumns} />,
    },
    {
      id: "schema",
      label: t("preview.tab-schema"),
      content: <SchemaTab schema={schema} loading={schemaLoading} />,
    },
    {
      id: "quality",
      label: t("preview.tab-quality"),
      content: <QualityTab report={qualityReport} />,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Preview header */}
      <div className="mb-3">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          {t("preview.title")}
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          {t("preview.description")}
        </p>
      </div>

      {/* Table name + summary row */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-[var(--text-muted)]">
          {t("preview.table")}: <code className="text-[var(--accent)]">{activeTable}</code>
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          {qualityReport ? (
            <>
              {qualityReport.totalRows.toLocaleString()} {t("table.rows-label")} · {qualityReport.totalColumns} {t("table.cols-label")}
              <span className="mx-1.5 text-[var(--border-default)]">·</span>
              {t("preview.preview-rows", { count: currentData.length })}
            </>
          ) : (
            <>
              {t("preview.preview-rows", { count: currentData.length })}
            </>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <TabGroup tabs={tabs} />
      </div>

      {/* Start Analysis entry */}
      <div className="mt-3 pt-3 border-t border-[var(--border-default)] flex items-center justify-between">
        <p className="text-xs text-[var(--text-muted)]">
          {t("preview.analysis-hint")}
        </p>
        <Link
          href="/analyze"
          className="text-xs font-medium text-[var(--accent)] hover:underline whitespace-nowrap ml-3"
        >
          {t("preview.start-analysis")}
        </Link>
      </div>
    </div>
  );
}

/* ── Preview Tab ── */

function PreviewTab({ data, columns }: { data: Record<string, unknown>[]; columns: string[] }) {
  const { t } = useTranslation();
  const { qualityReport } = useDataStore();

  return (
    <div>
      {/* Row / Column summary badges */}
      {qualityReport && (
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--accent)]/10 text-[var(--accent)]">
            {qualityReport.totalRows.toLocaleString()} {t("table.rows-label")}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--accent)]/10 text-[var(--accent)]">
            {qualityReport.totalColumns} {t("table.cols-label")}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
            {t("preview.preview-rows", { count: data.length })}
          </span>
        </div>
      )}
      <DataTable data={data} columns={columns} />
    </div>
  );
}

/* ── Schema Tab ── */

function SchemaTab({ schema, loading }: { schema: SchemaCol[]; loading: boolean }) {
  const { t } = useTranslation();

  if (loading) {
    return <div className="p-4"><Skeleton rows={8} className="h-4" /></div>;
  }

  if (schema.length === 0) {
    return (
      <EmptyState icon="📄" title={t("schema.empty")} description={t("preview.no-data-loaded")} />
    );
  }

  // Field type summary
  const typeCounts: Record<string, number> = {};
  for (const col of schema) {
    typeCounts[col.dtype] = (typeCounts[col.dtype] || 0) + 1;
  }

  return (
    <div className="overflow-auto">
      {/* Field type summary */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs text-[var(--text-muted)]">{t("quality.field-types")}:</span>
        {Object.entries(typeCounts).map(([type, count]) => (
          <span
            key={type}
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
          >
            {type} × {count}
          </span>
        ))}
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border-default)] text-left text-[var(--text-muted)]">
            <th className="px-3 py-2">{t("schema.column")}</th>
            <th className="px-3 py-2">{t("schema.type")}</th>
            <th className="px-3 py-2">{t("schema.nullable")}</th>
            <th className="px-3 py-2">{t("schema.unique")}</th>
          </tr>
        </thead>
        <tbody>
          {schema.map((col) => (
            <tr key={col.name} className="border-b border-[var(--border-default)]">
              <td className="px-3 py-2 text-[var(--accent)]">{col.name}</td>
              <td className="px-3 py-2 text-[var(--text-secondary)]">{col.dtype}</td>
              <td className="px-3 py-2">{col.nullable ? "✓" : "—"}</td>
              <td className="px-3 py-2">{col.uniqueCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Quality Tab ── */

function QualityTab({ report }: { report: import("@/types").QualityReport | null }) {
  const { t } = useTranslation();

  if (!report) {
    return (
      <EmptyState icon="📊" title={t("quality.empty")} description={t("quality.description")} />
    );
  }

  const qualityLabel = report.overallScore >= 80
    ? t("quality.ready")
    : t("quality.needs-attention");

  // Field type summary from field health
  const typeCounts: Record<string, number> = {};
  for (const fh of report.fieldHealth) {
    typeCounts[fh.dtype] = (typeCounts[fh.dtype] || 0) + 1;
  }

  // Total missing values
  const totalMissing = report.nullCells;
  const totalMissingPct = report.nullPct;

  return (
    <div className="space-y-4 p-2">
      {/* Quality header */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{t("quality.title")}</h3>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{t("quality.description")}</p>
      </div>

      {/* Overall score + quality label */}
      <div className="flex items-center gap-3">
        <ScoreCard label={t("quality.overall")} value={report.overallScore} />
        <p className={`text-xs ${report.overallScore >= 80 ? "text-green-400" : report.overallScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>
          {qualityLabel}
        </p>
      </div>

      {/* Sub-scores */}
      <div className="grid grid-cols-2 gap-3">
        <ScoreCard label={t("quality.completeness")} value={report.completenessScore} />
        <ScoreCard label={t("quality.consistency")} value={report.consistencyScore} />
        <ScoreCard label={t("quality.validity")} value={report.validityScore} />
        <ScoreCard label={t("quality.uniqueness")} value={report.uniquenessScore} />
      </div>

      {/* Stats badges: missing values, duplicates, outliers */}
      <div>
        <p className="text-xs font-medium text-[var(--text-muted)] mb-2">{t("quality.missing-values")}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <StatBadge
            label={t("quality.null-cells")}
            value={`${totalMissing.toLocaleString()} (${totalMissingPct}%)`}
            variant={totalMissingPct > 10 ? "warning" : "default"}
          />
          <StatBadge
            label={t("quality.duplicates")}
            value={report.duplicateRows.toLocaleString()}
            variant={report.duplicateRows > 0 ? "warning" : "default"}
          />
          <StatBadge
            label={t("quality.outliers")}
            value={report.totalOutliers.toLocaleString()}
            variant={report.totalOutliers > 0 ? "warning" : "default"}
          />
        </div>
      </div>

      {/* Field type summary */}
      {Object.keys(typeCounts).length > 0 && (
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)] mb-2">{t("quality.field-types")}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(typeCounts).map(([type, count]) => (
              <span
                key={type}
                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
              >
                {type} × {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {report.warnings.length > 0 && (
        <div className="space-y-1">
          {report.warnings.map((w, i) => (
            <p key={i} className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
              ⚠ {w}
            </p>
          ))}
        </div>
      )}

      {/* Field health table */}
      {report.fieldHealth.length > 0 && (
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--border-default)] text-left text-[var(--text-muted)]">
              <th className="px-2 py-1">{t("schema.column")}</th>
              <th className="px-2 py-1">{t("schema.type")}</th>
              <th className="px-2 py-1">{t("quality.nulls")}</th>
              <th className="px-2 py-1">{t("quality.outliers")}</th>
              <th className="px-2 py-1">{t("quality.score")}</th>
            </tr>
          </thead>
          <tbody>
            {report.fieldHealth.map((fh) => (
              <tr key={fh.name} className="border-b border-[var(--border-default)]">
                <td className="px-2 py-1 text-[var(--accent)]">{fh.name}</td>
                <td className="px-2 py-1 text-[var(--text-secondary)]">{fh.dtype}</td>
                <td className="px-2 py-1">{fh.nullCount} ({fh.nullPct}%)</td>
                <td className="px-2 py-1">{fh.outlierCount} ({fh.outlierPct}%)</td>
                <td className="px-2 py-1">
                  <span className={fh.score < 60 ? "text-red-400" : fh.score < 80 ? "text-yellow-400" : "text-green-400"}>
                    {fh.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ── Score Card ── */

function ScoreCard({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "text-green-400" : value >= 60 ? "text-yellow-400" : "text-red-400";
  return (
    <div className="bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-md px-3 py-2">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}

/* ── Stat Badge ── */

function StatBadge({ label, value, variant = "default" }: { label: string; value: string; variant?: "default" | "warning" }) {
  const bgColor = variant === "warning" ? "bg-yellow-400/10" : "bg-[var(--bg-tertiary)]";
  const textColor = variant === "warning" ? "text-yellow-400" : "text-[var(--text-secondary)]";
  return (
    <div className={`${bgColor} rounded-md px-2.5 py-1.5`}>
      <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
      <p className={`text-xs font-medium ${textColor}`}>{value}</p>
    </div>
  );
}
