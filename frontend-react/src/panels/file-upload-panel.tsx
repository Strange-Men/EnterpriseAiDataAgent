"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDataStore } from "@/stores/data-store";
import { useInvestigationStore } from "@/stores/investigation-store";
import { useTables } from "@/hooks/use-tables";
import { Tooltip } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/ui/empty-state";
import { uploadFile, fetchTableData, fetchQualityReport } from "@/services/api";
import { logger } from "@/services/logger";
import toast from "react-hot-toast";
import type { UploadedFile, TableInfo } from "@/types";
import { AIAnalysisPanel } from "@/panels/ai-analysis-panel";
import type { AnalysisMode } from "@/panels/ai-analysis-panel";

export function FileUploadPanel() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    uploadedFiles, setUploadedFiles,
    setCurrentData, setQualityReport,
  } = useDataStore();
  const { tables, reload: loadTables } = useTables();
  const [uploading, setUploading] = useState(false);
  const [analyzingTable, setAnalyzingTable] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

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
    if (mountedRef.current) setUploading(false);
    await loadTables();

    // Advance workflow: last successfully uploaded table
    const lastOk = [...newFiles].reverse().find((f) => f.status === "success" && f.tableName);
    if (lastOk?.tableName) {
      useInvestigationStore.getState().advance("profiling", { table: lastOk.tableName });
    }

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

  const handleAnalyze = (tableName: string, mode: AnalysisMode) => {
    if (analyzingTable === tableName && analysisMode === mode) {
      // Toggle off
      setAnalyzingTable(null);
      setAnalysisMode(null);
    } else {
      setAnalyzingTable(tableName);
      setAnalysisMode(mode);
      if (mode === "full-analysis") {
        useInvestigationStore.getState().advance("analyzing", { table: tableName });
      }
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
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {t("upload.formats")}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          {t("upload.guidance")}
        </p>
        <p className="text-[11px] text-[var(--accent)] mt-2 font-medium">
          {t("upload.flow")}
        </p>
      </div>

      {/* Database tables */}
      {tables.length > 0 && (
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{t("upload.db-tables")}</p>
          <div className="space-y-1">
            {tables.map((tbl: TableInfo) => (
              <div key={tbl.name} className="space-y-1">
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-md bg-[var(--bg-primary)] border border-[var(--border-default)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                  onClick={() => handleTableClick(tbl.name)}
                >
                  <Tooltip text={tbl.name} maxLen={25} />
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAnalyze(tbl.name, "full-analysis"); }}
                      className={`px-1.5 py-0.5 text-[10px] rounded border transition-colors ${
                        analyzingTable === tbl.name && analysisMode === "full-analysis"
                          ? "border-purple-500 bg-purple-500/10 text-purple-400"
                          : "border-[var(--border-default)] text-[var(--text-muted)] hover:text-purple-400 hover:border-purple-500/50"
                      }`}
                    >
                      AI
                    </button>
                    <span className="text-xs text-[var(--text-muted)]">
                      {tbl.rowCount} × {tbl.columnCount}
                    </span>
                  </div>
                </div>
                {/* Inline AI Analysis Panel for tables */}
                {analyzingTable === tbl.name && analysisMode && (
                  <div className="max-h-[400px]">
                    <AIAnalysisPanel
                      mode={analysisMode}
                      tableName={tbl.name}
                      onClose={() => { setAnalyzingTable(null); setAnalysisMode(null); }}
                      onComplete={(table) => useInvestigationStore.getState().advance("sql-ready", { table })}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
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
                <>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {t("upload.rows")}: {f.rowCount} · {t("upload.columns")}: {f.columnCount}
                  </p>
                  {f.tableName && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <button
                        onClick={() => handleAnalyze(f.tableName!, "full-analysis")}
                        className={`px-2 py-1 text-[10px] rounded-md border transition-colors ${
                          analyzingTable === f.tableName && analysisMode === "full-analysis"
                            ? "border-purple-500 bg-purple-500/10 text-purple-400"
                            : "border-[var(--border-default)] text-[var(--text-muted)] hover:text-purple-400 hover:border-purple-500/50"
                        }`}
                      >
                        {t("upload.analyze")}
                      </button>
                      <button
                        onClick={() => handleAnalyze(f.tableName!, "charts")}
                        className={`px-2 py-1 text-[10px] rounded-md border transition-colors ${
                          analyzingTable === f.tableName && analysisMode === "charts"
                            ? "border-blue-500 bg-blue-500/10 text-blue-400"
                            : "border-[var(--border-default)] text-[var(--text-muted)] hover:text-blue-400 hover:border-blue-500/50"
                        }`}
                      >
                        {t("ai.charts-title")}
                      </button>
                    </div>
                  )}
                </>
              )}
              {f.status === "error" && (
                <div className="mt-1">
                  <p className="text-xs text-yellow-400">{t("upload.error-hint")}</p>
                  {f.error && (
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5 opacity-70">{f.error}</p>
                  )}
                </div>
              )}

              {/* Inline AI Analysis Panel */}
              {f.tableName && analyzingTable === f.tableName && analysisMode && (
                <div className="mt-2 max-h-[400px]">
                  <AIAnalysisPanel
                    mode={analysisMode}
                    tableName={f.tableName}
                    onClose={() => { setAnalyzingTable(null); setAnalysisMode(null); }}
                    onComplete={(table) => useInvestigationStore.getState().advance("sql-ready", { table })}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {tables.length === 0 && uploadedFiles.length === 0 && (
        <EmptyState
          icon="📄"
          title={t("upload.no-files")}
          description={t("upload.no-files-desc")}
        />
      )}
    </div>
  );
}
