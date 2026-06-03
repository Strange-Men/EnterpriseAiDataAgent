import { QualityGates } from "@/components/ai/quality-gates";
import type { AiQualityGate } from "@/services/api";

interface AiSqlInputProps {
  value: string;
  isLoading: boolean;
  placeholder: string;
  generateLabel: string;
  generatingLabel: string;
  qualityGates?: AiQualityGate[];
  onChange: (value: string) => void;
  onGenerate: () => void;
  onClose: () => void;
}

export function AiSqlInput({
  value,
  isLoading,
  placeholder,
  generateLabel,
  generatingLabel,
  qualityGates,
  onChange,
  onGenerate,
  onClose,
}: AiSqlInputProps) {
  return (
    <div className="px-3 py-2 mb-2 bg-purple-500/5 border border-purple-500/20 rounded-md">
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onGenerate();
            if (e.key === "Escape") onClose();
          }}
          placeholder={placeholder}
          className="flex-1 px-2 py-1 text-xs bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-md focus:border-purple-500/50 focus:outline-none"
          autoFocus
        />
        <button
          onClick={onGenerate}
          disabled={isLoading || !value.trim()}
          className="px-3 py-1 text-xs bg-purple-500/10 text-purple-400 rounded-md hover:bg-purple-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              {generatingLabel}
            </span>
          ) : generateLabel}
        </button>
        <button
          onClick={onClose}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          x
        </button>
      </div>
      <QualityGates gates={qualityGates} compact />
    </div>
  );
}
