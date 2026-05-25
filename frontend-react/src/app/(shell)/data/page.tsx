"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Database, Upload, Table2, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DataPage() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <EmptyState
        icon={<Database className="w-8 h-8" />}
        title={t("nav.data")}
        description="Upload CSV and Excel files, manage datasets, and view data quality reports."
        action={
          <Button variant="primary" size="lg" onClick={() => router.push("/analyze")} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Go to Analyze
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="py-4 text-center">
            <Upload className="w-5 h-5 text-[var(--accent)] mx-auto mb-2" />
            <p className="text-xs font-medium text-[var(--text-primary)]">File Upload</p>
            <p className="text-2xs text-[var(--text-muted)] mt-0.5">CSV, Excel, JSON support with drag & drop</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Table2 className="w-5 h-5 text-[var(--accent)] mx-auto mb-2" />
            <p className="text-xs font-medium text-[var(--text-primary)]">Table Management</p>
            <p className="text-2xs text-[var(--text-muted)] mt-0.5">Browse, rename, export, and delete tables</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Database className="w-5 h-5 text-[var(--accent)] mx-auto mb-2" />
            <p className="text-xs font-medium text-[var(--text-primary)]">Data Quality</p>
            <p className="text-2xs text-[var(--text-muted)] mt-0.5">Automated profiling, completeness & consistency scores</p>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-2xs text-[var(--text-muted)]">
        Data workspace is available in the Analyze view —{" "}
        <button onClick={() => router.push("/analyze")} className="text-[var(--accent)] hover:underline">open it here</button>
      </p>
    </div>
  );
}
