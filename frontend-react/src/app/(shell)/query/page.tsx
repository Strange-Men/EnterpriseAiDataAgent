"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { MonitorPlay } from "lucide-react";

export default function QueryPage() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <MonitorPlay className="w-12 h-12 text-[var(--accent)]/40 mb-4" strokeWidth={1} />
      <p className="text-sm text-[var(--text-muted)] mb-4 max-w-md">
        {t("workspace.query-redirect")}
      </p>
      <button
        onClick={() => router.push("/analyze")}
        className="px-4 py-2 text-sm bg-[var(--accent)] text-[var(--bg-primary)] rounded-md hover:bg-[var(--accent-hover)] transition-colors font-medium"
      >
        {t("workspace.goto-workspace")}
      </button>
    </div>
  );
}
