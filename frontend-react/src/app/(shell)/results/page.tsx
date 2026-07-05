"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useSqlHistoryStore } from "@/stores/sql-history-store";

export default function ResultsPage() {
  const { t } = useTranslation();
  const history = useSqlHistoryStore((s) => s.history);
  const records = history.slice(0, 8);

  return (
    <div className="h-full overflow-y-auto px-6 py-5 space-y-4">
      <PageHeader
        title={t("results.title")}
        description={t("results.description")}
      />

      {records.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<BarChart3 className="h-6 w-6" />}
              title={t("results.empty-title")}
              description={t("results.empty-description")}
              action={(
                <Link href="/analyze">
                  <Button size="sm">{t("results.start-analysis")}</Button>
                </Link>
              )}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {records.map((record) => {
            const title = record.question || record.summary || t("results.record-title");
            return (
              <Card key={record.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="normal-case tracking-normal text-[var(--text-primary)]">
                      {title}
                    </CardTitle>
                    <CardDescription>
                      {record.tableName || t("results.no-table")} · {new Date(record.timestamp).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={record.status === "success" ? "success" : record.status === "error" ? "error" : "warning"}
                  >
                    {t(`results.status-${record.status}`)}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-[var(--text-secondary)]">
                    {record.summary || t("results.summary-placeholder")}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span>{t("results.rows", { count: record.rowCount })}</span>
                    <span>·</span>
                    <span>{t("results.runtime", { ms: record.runtimeMs })}</span>
                  </div>
                  <Link href={`/analyze/${record.id}`}>
                    <Button size="sm" variant="secondary">
                      {t("results.open-result")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
