"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Clock, Search, Filter, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HistoryPage() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <EmptyState
        icon={<Clock className="w-8 h-8" />}
        title={t("nav.history")}
        description="Browse your SQL query history and analysis run history with search and filtering."
        action={
          <Button variant="primary" size="lg" onClick={() => router.push("/analyze")} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Go to Analyze
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="py-4 text-center">
            <Search className="w-5 h-5 text-[var(--accent)] mx-auto mb-2" />
            <p className="text-xs font-medium text-[var(--text-primary)]">Query History</p>
            <p className="text-2xs text-[var(--text-muted)] mt-0.5">Full search, filter by status, re-run with one click</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Filter className="w-5 h-5 text-[var(--accent)] mx-auto mb-2" />
            <p className="text-xs font-medium text-[var(--text-primary)]">Run History</p>
            <p className="text-2xs text-[var(--text-muted)] mt-0.5">Past AI analysis runs with trace, evaluation, drill-down</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Clock className="w-5 h-5 text-[var(--accent)] mx-auto mb-2" />
            <p className="text-xs font-medium text-[var(--text-primary)]">Timeline View</p>
            <p className="text-2xs text-[var(--text-muted)] mt-0.5">Evolution chain visualization of drill-down investigations</p>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-2xs text-[var(--text-muted)]">
        History is available in the Analyze view —{" "}
        <button onClick={() => router.push("/analyze")} className="text-[var(--accent)] hover:underline">open it here</button>
      </p>
    </div>
  );
}
