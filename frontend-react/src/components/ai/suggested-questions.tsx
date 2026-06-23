import { useTranslation } from "react-i18next";

export function SuggestedQuestions({
  questions,
  onQuestionClick,
}: {
  questions: { question: string; reason: string }[];
  onQuestionClick?: (question: string) => void;
}) {
  const { t } = useTranslation();

  if (!questions.length) return null;

  return (
    <div className="mt-4 pt-3 border-t border-[var(--border-default)]">
      <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">
        {t("ai.suggested-questions")}
      </p>
      <div className="space-y-1.5">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => onQuestionClick?.(q.question)}
            className="w-full text-left px-3 py-2 rounded-md bg-[var(--bg-primary)] border border-[var(--border-default)] hover:border-[var(--accent)] transition-colors group"
          >
            <p className="text-xs text-[var(--text-primary)] group-hover:text-[var(--accent)]">{q.question}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{q.reason}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
