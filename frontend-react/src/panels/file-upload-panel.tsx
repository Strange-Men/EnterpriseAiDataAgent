"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useDataStore } from "@/stores/data-store";
import { useInvestigationStore } from "@/stores/investigation-store";
import { useTables } from "@/hooks/use-tables";
import { Tooltip } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/ui/empty-state";
import { uploadFile, fetchTableData, fetchQualityReport } from "@/services/api";
import { logger } from "@/services/logger";
import type { TableInfo, UploadedFile } from "@/types";

export function FileUploadPanel() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadedFiles, setUploadedFiles, setCurrentData, setQualityReport } = useDataStore();
  const { tables, reload: loadTables } = useTables();
  const [uploading, setUploading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const toastId = toast.loading(t("upload.uploading"));
    const nextFiles: UploadedFile[] = [...uploadedFiles];
    let successCount = 0;
    let failCount = 0;

    for (const file of Array.from(files)) {
      const entry: UploadedFile = {
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type || "unknown",
        uploadedAt: new Date().toISOString(),
        rowCount: 0,
        columnCount: 0,
        status: "pending",
      };
      nextFiles.push(entry);

      try {
        const result = await uploadFile(file);
        entry.status = "success";
        entry.tableName = result.tableName;
        entry.rowCount = result.rowCount;
        entry.columnCount = result.columnCount;
        successCount += 1;
        logger.info("upload", `${file.name} -> ${result.tableName} (${result.rowCount} rows)`);
      } catch (error: unknown) {
        entry.status = "error";
        entry.error = error instanceof Error ? error.message : "Upload failed";
        failCount += 1;
        logger.error("upload", `Failed: ${file.name}`, error);
      }
    }

    setUploadedFiles([...nextFiles]);
    if (mountedRef.current) setUploading(false);
    await loadTables();

    const lastSuccessful = [...nextFiles].reverse().find((file) => file.status === "success" && file.tableName);
    if (lastSuccessful?.tableName) {
      useInvestigationStore.getState().advance("profiling", { table: lastSuccessful.tableName });
    }

    toast.dismiss(toastId);
    if (failCount === 0) {
      toast.success(t("upload.success-count", { count: successCount }));
    } else if (successCount > 0) {
      toast.error(t("upload.partial-count", { success: successCount, failed: failCount }));
    } else {
      toast.error(t("upload.failed-count", { count: failCount }));
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTableClick = async (tableName: string) => {
    useInvestigationStore.getState().setContext({ table: tableName });
    try {
      const { columns, data } = await fetchTableData(tableName);
      setCurrentData(data, columns);
    } catch {
      setCurrentData(null);
    }
    try {
      const report = await fetchQualityReport(tableName);
      setQualityReport(report);
    } catch {
      setQualityReport(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--border-default)] pb-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
        {t("nav.file-upload")}
      </div>

      <div
        className="cursor-pointer rounded-lg border-2 border-dashed border-[var(--border-default)] p-6 text-center transition-colors hover:border-[var(--accent)]"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-sm text-[var(--text-muted)]">
          {uploading ? t("upload.uploading") : t("upload.dropzone")}
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{t("upload.formats")}</p>
        <p className="mt-2 text-xs text-[var(--text-muted)]">{t("upload.guidance")}</p>
        <p className="mt-2 text-[11px] font-medium text-[var(--accent)]">{t("upload.flow")}</p>
      </div>

      {tables.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">{t("upload.db-tables")}</p>
          <div className="space-y-1">
            {tables.map((table: TableInfo) => (
              <button
                key={table.name}
                onClick={() => handleTableClick(table.name)}
                className="flex w-full items-center justify-between rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-left transition-colors hover:border-[var(--accent)]"
              >
                <Tooltip text={table.name} maxLen={25} />
                <span className="shrink-0 text-xs text-[var(--text-muted)]">
                  {table.rowCount.toLocaleString()} x {table.columnCount}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span>{file.status === "success" ? "OK" : file.status === "error" ? "!" : "..."}</span>
                <Tooltip text={file.name} maxLen={20} />
              </div>
              {file.status === "success" && (
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {t("upload.rows")}: {file.rowCount.toLocaleString()} · {t("upload.columns")}: {file.columnCount}
                </p>
              )}
              {file.status === "error" && (
                <div className="mt-1">
                  <p className="text-xs text-yellow-400">{t("upload.error-hint")}</p>
                  {file.error && (
                    <p className="mt-0.5 text-[10px] text-[var(--text-muted)] opacity-70">{file.error}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tables.length === 0 && uploadedFiles.length === 0 && (
        <EmptyState
          icon="file"
          title={t("upload.no-files")}
          description={t("upload.no-files-desc")}
        />
      )}
    </div>
  );
}
