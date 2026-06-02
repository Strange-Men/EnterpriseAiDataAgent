"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
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
        icon=" "
        title={t("preview.no-data")}
        description="Select a table from the left panel to preview its data"
      />
    );
  }

  if (!currentData || currentData.length === 0) {
    return (
      <EmptyState
        icon=" "
        title="No data loaded"
        description="Click on a table name to load its data"
      />
    );
  }

  const tabs = [
    {
      id: "preview",
      label: t("preview.tab-preview"),
      content: <DataTable data={currentData} columns={currentColumns} />,
    },
    {
      id: "schema",
      label: t("preview.tab-schema"),
      content: (
        <div className="overflow-auto">
          {schemaLoading ? (
            <div className="p-4"><Skeleton rows={8} className="h-4" /></div>
          ) : schema.length > 0 ? (
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
          ) : (
            <EmptyState icon=" " title={t("schema.empty")} description="Schema information unavailable" />
          )}
        </div>
      ),
    },
    {
      id: "quality",
      label: t("preview.tab-quality"),
      content: (
        <div className="overflow-auto">
          {qualityReport ? (
            <div className="space-y-4 p-2">
              {/* Scores */}
              <div className="grid grid-cols-2 gap-3">
                <ScoreCard label={t("quality.overall")} value={qualityReport.overallScore} />
                <ScoreCard label={t("quality.completeness")} value={qualityReport.completenessScore} />
                <ScoreCard label={t("quality.consistency")} value={qualityReport.consistencyScore} />
                <ScoreCard label={t("quality.validity")} value={qualityReport.validityScore} />
                <ScoreCard label={t("quality.uniqueness")} value={qualityReport.uniquenessScore} />
              </div>
              {/* Stats */}
              <div className="text-xs text-[var(--text-muted)] space-y-1">
                <p>{t("quality.null-cells")}: {qualityReport.nullCells} ({qualityReport.nullPct}%)</p>
                <p>{t("quality.duplicates")}: {qualityReport.duplicateRows}</p>
                <p>{t("quality.outliers")}: {qualityReport.totalOutliers}</p>
              </div>
              {/* Warnings */}
              {qualityReport.warnings.length > 0 && (
                <div className="space-y-1">
                  {qualityReport.warnings.map((w, i) => (
                    <p key={i} className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                      ⚠ {w}
                    </p>
                  ))}
                </div>
              )}
              {/* Field health */}
              {qualityReport.fieldHealth.length > 0 && (
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
                    {qualityReport.fieldHealth.map((fh) => (
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
          ) : (
            <EmptyState
              icon=" "
              title={t("quality.empty")}
              description="Select a table to view its quality report"
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {activeTable && (
        <div className="text-xs text-[var(--text-muted)] mb-2">
          {t("preview.table")}: <code className="text-[var(--accent)]">{activeTable}</code>
        </div>
      )}
      <div className="flex-1 min-h-0">
        <TabGroup tabs={tabs} />
      </div>
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "text-green-400" : value >= 60 ? "text-yellow-400" : "text-red-400";
  return (
    <div className="bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-md px-3 py-2">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
