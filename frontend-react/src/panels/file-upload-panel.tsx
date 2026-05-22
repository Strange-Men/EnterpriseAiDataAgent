"use client";

import { useTranslation } from "react-i18next";
import { useDataStore } from "@/stores/data-store";
import { Tooltip } from "@/components/ui/tooltip";

export function FileUploadPanel() {
  const { t } = useTranslation();
  const { tables, uploadedFiles } = useDataStore();

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider pb-2 border-b border-[var(--border-default)]">
        {t("nav.file-upload")}
      </div>

      {/* Drop zone */}
      <div className="border-2 border-dashed border-[var(--border-default)] rounded-lg p-6 text-center hover:border-[var(--accent)] transition-colors cursor-pointer">
        <p className="text-sm text-[var(--text-muted)]">{t("upload.dropzone")}</p>
      </div>

      {/* Database tables */}
      {tables.length > 0 && (
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{t("upload.db-tables")}</p>
          <div className="space-y-1">
            {tables.map((tbl) => (
              <div
                key={tbl.name}
                className="flex items-center justify-between px-3 py-2 rounded-md bg-[var(--bg-primary)] border border-[var(--border-default)] hover:border-[var(--accent)] transition-colors cursor-pointer"
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
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {t("upload.rows")}: {f.rowCount} · {t("upload.columns")}: {f.columnCount}
              </p>
            </div>
          ))}
        </div>
      )}

      {tables.length === 0 && uploadedFiles.length === 0 && (
        <p className="text-sm text-[var(--text-muted)]">{t("upload.no-files")}</p>
      )}
    </div>
  );
}
