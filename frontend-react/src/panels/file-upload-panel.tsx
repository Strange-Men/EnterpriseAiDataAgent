"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDataStore } from "@/stores/data-store";
import { Tooltip } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchTables, uploadFile, fetchTableData, fetchQualityReport } from "@/services/api";
import { logger } from "@/services/logger";
import toast from "react-hot-toast";
import type { UploadedFile, TableInfo } from "@/types";

export function FileUploadPanel() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    tables, setTables, setDbStatus,
    uploadedFiles, setUploadedFiles,
    setCurrentTable, setCurrentData, setQualityReport,
  } = useDataStore();
  const [uploading, setUploading] = useState(false);

  const loadTables = useCallback(async () => {
    try {
      const tbls = await fetchTables();
      setTables(tbls);
      setDbStatus("connected");
    } catch {
      setDbStatus("error");
    }
  }, [setTables, setDbStatus]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    const id = toast.loading(`Uploading ${files.length} file(s)...`);
    const newFiles: UploadedFile[] = [...uploadedFiles];
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
      newFiles.push(entry);

      try {
        const result = await uploadFile(file);
        entry.status = "success";
        entry.tableName = result.tableName;
        entry.rowCount = result.rowCount;
        entry.columnCount = result.columnCount;
        successCount++;
        logger.info("upload", `${file.name} → ${result.tableName} (${result.rowCount} rows)`);
      } catch (err: unknown) {
        entry.status = "error";
        entry.error = err instanceof Error ? err.message : "Upload failed";
        failCount++;
        logger.error("upload", `Failed: ${file.name}`, err);
      }
    }

    setUploadedFiles([...newFiles]);
    setUploading(false);
    await loadTables();

    toast.dismiss(id);
    if (failCount === 0) {
      toast.success(`Uploaded ${successCount} file(s) successfully`);
    } else if (successCount > 0) {
      toast.error(`${successCount} succeeded, ${failCount} failed`);
    } else {
      toast.error(`All ${failCount} file(s) failed to upload`);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTableClick = async (tableName: string) => {
    setCurrentTable(tableName);
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
      <div className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider pb-2 border-b border-[var(--border-default)]">
        {t("nav.file-upload")}
      </div>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-[var(--border-default)] rounded-lg p-6 text-center hover:border-[var(--accent)] transition-colors cursor-pointer"
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
        <p className="text-xs text-[var(--text-muted)] mt-1">CSV, XLSX, XLS</p>
      </div>

      {/* Database tables */}
      {tables.length > 0 && (
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{t("upload.db-tables")}</p>
          <div className="space-y-1">
            {tables.map((tbl: TableInfo) => (
              <div
                key={tbl.name}
                className="flex items-center justify-between px-3 py-2 rounded-md bg-[var(--bg-primary)] border border-[var(--border-default)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                onClick={() => handleTableClick(tbl.name)}
              >
                <Tooltip text={tbl.name} maxLen={25} />
                <span className="text-xs text-[var(--text-muted)]">
                  {tbl.rowCount} × {tbl.columnCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-1">
          {uploadedFiles.map((f, i) => (
            <div
              key={i}
              className="px-3 py-2 rounded-md bg-[var(--bg-primary)] border border-[var(--border-default)]"
            >
              <div className="flex items-center gap-2">
                <span>{f.status === "success" ? "✅" : f.status === "error" ? "❌" : "⏳"}</span>
                <Tooltip text={f.name} maxLen={20} />
              </div>
              {f.status === "success" && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {t("upload.rows")}: {f.rowCount} · {t("upload.columns")}: {f.columnCount}
                </p>
              )}
              {f.status === "error" && (
                <p className="text-xs text-red-400 mt-1">{f.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {tables.length === 0 && uploadedFiles.length === 0 && (
        <EmptyState
          icon=""
          title={t("upload.no-files")}
          description="Upload CSV or Excel files to get started"
        />
      )}
    </div>
  );
}
