"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Code, Play, Table, Zap, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function QueryPage() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <EmptyState
        icon={<Code className="w-8 h-8" />}
        title={t("nav.query")}
        description="Write and execute SQL queries with autocomplete, multi-tab support, and query history."
        action={
          <Button variant="primary" size="lg" onClick={() => router.push("/analyze")} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Go to Analyze
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="py-4 text-center">
            <Play className="w-5 h-5 text-[var(--accent)] mx-auto mb-2" />
            <p className="text-xs font-medium text-[var(--text-primary)]">SQL Editor</p>
            <p className="text-2xs text-[var(--text-muted)] mt-0.5">Monaco editor with DuckDB autocomplete & syntax highlighting</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Table className="w-5 h-5 text-[var(--accent)] mx-auto mb-2" />
            <p className="text-xs font-medium text-[var(--text-primary)]">Query Results</p>
            <p className="text-2xs text-[var(--text-muted)] mt-0.5">Virtualized table with pagination for datasets up to 10K rows</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Zap className="w-5 h-5 text-[var(--accent)] mx-auto mb-2" />
            <p className="text-xs font-medium text-[var(--text-primary)]">Quick Actions</p>
            <p className="text-2xs text-[var(--text-muted)] mt-0.5">Export CSV/JSON/Excel, explain plans, format & save queries</p>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-2xs text-[var(--text-muted)]">
        Full SQL workspace is available in the Analyze view —{" "}
        <button onClick={() => router.push("/analyze")} className="text-[var(--accent)] hover:underline">open it here</button>
      </p>
    </div>
  );
}
