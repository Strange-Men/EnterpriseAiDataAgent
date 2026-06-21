"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { aiQuery } from "@/services/api";
import type { FollowUpContext } from "@/services/api";
import { useInvestigationStore } from "@/stores/investigation-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FollowUpInputProps {
  results?: Record<string, unknown>[];
  onSqlGenerated?: (sql: string) => void;
  question?: string;
  onQuestionChange?: (q: string) => void;
}

export function FollowUpInput({ results, onSqlGenerated, question: controlledQuestion, onQuestionChange }: FollowUpInputProps) {
  const { t, i18n } = useTranslation();
  const [internalQuestion, setInternalQuestion] = useState("");
  const question = controlledQuestion !== undefined ? controlledQuestion : internalQuestion;
  const setQuestion = useCallback((val: string) => {
    if (controlledQuestion !== undefined) {
      onQuestionChange?.(val);
    } else {
      setInternalQuestion(val);
    }
  }, [controlledQuestion, onQuestionChange]);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  // Cleanup: prevent state updates after unmount
  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const handleSubmit = useCallback(async () => {
    const q = question.trim();
    if (!q || loading) return;

    setLoading(true);
    try {
      const sessionStore = useInvestigationStore.getState();

      const ctx: FollowUpContext = {};
      if (sessionStore.lastSql) ctx.previous_sql = sessionStore.lastSql;
      if (sessionStore.lastInsightSummary) ctx.previous_insight_summary = sessionStore.lastInsightSummary;
      if (results && results.length > 0) {
        ctx.previous_result_schema = Object.keys(results[0]).map((key) => {
          const val = results[0][key];
          const dtype = typeof val === "number" ? (Number.isInteger(val) ? "INTEGER" : "DOUBLE")
            : typeof val === "boolean" ? "BOOLEAN" : "VARCHAR";
          return { name: key, dtype };
        });
        ctx.previous_sample_rows = results.slice(0, 5);
      }
      // Enhanced: enrich with accumulated key findings and investigation summary
      if (sessionStore.keyFindings.length > 0) {
        ctx.prior_key_findings = sessionStore.keyFindings.slice(0, 5);
      }
      if (sessionStore.investigationSummary) {
        ctx.investigation_summary = sessionStore.investigationSummary;
      }

      const currentTable = useInvestigationStore.getState().activeTable;
      const res = await aiQuery(q, true, true, Object.keys(ctx).length > 0 ? ctx : undefined, i18n.language, currentTable ?? undefined);

      if (res.sql && res.status === "success") {
        sessionStore.addUserTurn(q);
        // Store a description as insight summary, not raw SQL
        const description = res.explanation || `Generated SQL for: ${q}`;
        sessionStore.addAssistantTurn(description, res.sql);
        onSqlGenerated?.(res.sql);
        toast.success(t("ai.sql-generated"));
        setQuestion("");
      } else {
        toast.error(res.error || "AI could not generate SQL");
      }
    } catch (err) {
      if (mountedRef.current) toast.error(err instanceof Error ? err.message : t("ai.analysis-failed"));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [question, loading, results, onSqlGenerated, t, i18n.language, setQuestion]);

  if (!onSqlGenerated) return null;

  return (
    <div className="mt-4 pt-3 border-t border-[var(--border-default)]">
      <p className="text-xs text-[var(--text-muted)] mb-2">{t("ai.follow-up-hint")}</p>
      <div className="flex gap-2">
        <Input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          placeholder={t("ai.follow-up-placeholder")}
          className="flex-1"
          disabled={loading}
        />
        <Button
          onClick={handleSubmit}
          disabled={loading || !question.trim()}
          variant="primary"
          size="md"
          loading={loading}
          className="shrink-0"
        >
          {loading ? t("ai.generating") : t("ai.generate-sql")}
        </Button>
      </div>
    </div>
  );
}
