"use client";

import { useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useThemeStore } from "@/hooks/use-theme";
import { safeMarkdownContent, renderSafeText } from "@/utils/safe-render";

// ── Theme-aware syntax highlighter style ──────────────────────
const lightTheme: Record<string, React.CSSProperties> = {
  'pre[class*="language-"]': { background: "#f6f8fa", color: "#24292f", padding: "12px", borderRadius: "6px", overflow: "auto", fontSize: "13px" },
  'code[class*="language-"]': { background: "none", color: "#24292f", fontSize: "13px" },
  comment: { color: "#6a737d" }, keyword: { color: "#cf222e" }, string: { color: "#0a3069" },
  function: { color: "#8250df" }, number: { color: "#0550ae" }, operator: { color: "#cf222e" },
  punctuation: { color: "#24292f" }, builtin: { color: "#0550ae" }, property: { color: "#953800" },
};

const darkTheme: Record<string, React.CSSProperties> = {
  'pre[class*="language-"]': { background: "#161b22", color: "#e6edf3", padding: "12px", borderRadius: "6px", overflow: "auto", fontSize: "13px" },
  'code[class*="language-"]': { background: "none", color: "#e6edf3", fontSize: "13px" },
  comment: { color: "#8b949e" }, keyword: { color: "#ff7b72" }, string: { color: "#a5d6ff" },
  function: { color: "#d2a8ff" }, number: { color: "#79c0ff" }, operator: { color: "#ff7b72" },
  punctuation: { color: "#e6edf3" }, builtin: { color: "#79c0ff" }, property: { color: "#ffa657" },
};

function useCodeTheme() {
  const theme = useThemeStore((s) => s.theme);
  return theme === "dark" ? darkTheme : lightTheme;
}

// ── Types ─────────────────────────────────────────────────────
export interface AnalysisSection {
  title: string;
  content: string;
  type: "markdown" | "sql" | "json";
}

// ── Component ─────────────────────────────────────────────────
export function AnalysisSectionView({ section }: { section: AnalysisSection }) {
  const { t } = useTranslation();
  const codeTheme = useCodeTheme();

  // Guard: ensure content is a safe string for ReactMarkdown
  const safeContent = safeMarkdownContent(section.content, t("analysis.no-content"));

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(safeContent).then(
      () => toast.success(t("ai.copied")),
      () => toast.error(t("ai.copy-failed"))
    );
  }, [safeContent, t]);

  const markdownComponents = useMemo(() => ({
    code({ className, children, ...props }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
      const match = /language-(\w+)/.exec(className || "");
      const isInline = !match;
      if (isInline) {
        return (
          <code className="px-1.5 py-0.5 rounded text-xs font-mono bg-[var(--bg-tertiary)] text-[var(--accent)]" {...props}>
            {children}
          </code>
        );
      }
      return (
        <SyntaxHighlighter
          style={codeTheme as Record<string, React.CSSProperties>}
          language={match[1]}
          PreTag="div"
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      );
    },
    table({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
      return (
        <div className="overflow-x-auto my-2">
          <table className="min-w-full text-xs border-collapse border border-[var(--border-default)]" {...props}>
            {children}
          </table>
        </div>
      );
    },
    th({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) {
      return (
        <th className="px-3 py-1.5 text-left font-semibold bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-primary)]" {...props}>
          {children}
        </th>
      );
    },
    td({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) {
      return (
        <td className="px-3 py-1.5 border border-[var(--border-default)] text-[var(--text-secondary)]" {...props}>
          {children}
        </td>
      );
    },
    h3({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
      return <h3 className="text-sm font-semibold text-[var(--text-primary)] mt-3 mb-1" {...props}>{children}</h3>;
    },
    h4({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
      return <h4 className="text-xs font-semibold text-[var(--accent)] mt-2 mb-1" {...props}>{children}</h4>;
    },
    ul({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) {
      return <ul className="list-disc pl-4 space-y-0.5 text-sm text-[var(--text-secondary)]" {...props}>{children}</ul>;
    },
    li({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) {
      return <li className="text-sm" {...props}>{children}</li>;
    },
    p({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
      return <p className="text-sm text-[var(--text-secondary)] mb-1" {...props}>{children}</p>;
    },
    strong({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
      return <strong className="font-semibold text-[var(--text-primary)]" {...props}>{children}</strong>;
    },
  }), [codeTheme]);

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
          {renderSafeText(section.title, t("analysis.section-fallback"))}
        </h3>
        <button
          onClick={handleCopy}
          className="p-0.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          title={t("ai.copy-section")}
        >
          <Copy className="w-3 h-3" />
        </button>
      </div>
      <div className="ai-markdown-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {safeContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
