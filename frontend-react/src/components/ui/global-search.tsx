"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, Database, FileText } from "lucide-react";
import { useAnalysisStore } from "@/stores/analysis-store";
import { cn } from "@/utils/cn";

interface SearchResult {
  id: string;
  type: "run" | "table" | "page";
  label: string;
  detail?: string;
  href: string;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
  tables: { name: string }[];
}

export function GlobalSearch({ open, onClose, tables }: GlobalSearchProps) {
  const router = useRouter();
  const allRuns = useAnalysisStore((s) => s.runs);
  const runs = useMemo(() => allRuns.slice(-30), [allRuns]);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim() || query.length < 1) return [];
    const q = query.toLowerCase();

    const pageResults: SearchResult[] = [
      { label: "Home", href: "/" },
      { label: "Data", href: "/data" },
      { label: "SQL Query", href: "/query" },
      { label: "AI Analyze", href: "/analyze" },
      { label: "History", href: "/history" },
      { label: "Settings", href: "/settings" },
    ]
      .filter((p) => p.label.toLowerCase().includes(q))
      .map((p) => ({ id: `page-${p.href}`, type: "page" as const, label: p.label, href: p.href }));

    const tableResults: SearchResult[] = tables
      .filter((t) => t.name.toLowerCase().includes(q))
      .map((t) => ({
        id: `table-${t.name}`, type: "table" as const,
        label: t.name, href: "/analyze", detail: "Table",
      }));

    const runResults: SearchResult[] = runs
      .filter((r) =>
        r.question?.toLowerCase().includes(q) ||
        r.table?.toLowerCase().includes(q) ||
        r.mode?.toLowerCase().includes(q)
      )
      .slice(0, 15)
      .map((r) => ({
        id: r.id, type: "run" as const,
        label: r.question?.slice(0, 60) || r.mode || "Analysis",
        detail: r.table ?? "",
        href: `/analyze/${r.id}`,
      }));

    return [...pageResults.slice(0, 3), ...tableResults.slice(0, 5), ...runResults];
  }, [query, runs, tables]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((p) => Math.min(p + 1, results.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((p) => Math.max(p - 1, 0)); }
      else if (e.key === "Enter") {
        e.preventDefault();
        const r = results[selectedIndex];
        if (r) { router.push(r.href); onClose(); }
      }
      else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, selectedIndex, results, router, onClose]);

  if (!open) return null;

  const iconMap = { run: Clock, table: Database, page: FileText };

  return (
    <div
      className="fixed inset-0 z-command flex items-start justify-center pt-[20vh]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg mx-4 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl shadow-ds-lg overflow-hidden animate-slide-down">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-default)]">
          <Search className="w-4 h-4 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Search runs, tables, pages..."
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded text-[var(--text-muted)]">Esc</kbd>
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {results.length === 0 && query.length > 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">No results for "{query}"</div>
          ) : query.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--text-muted)]">Start typing to search...</div>
          ) : (
            results.map((r, i) => {
              const Icon = iconMap[r.type];
              const isSelected = i === selectedIndex;
              return (
                <button
                  key={r.id}
                  onClick={() => { router.push(r.href); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors",
                    isSelected ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-[var(--accent)]" : "text-[var(--text-muted)]")} />
                  <span className="text-xs flex-1 truncate">{r.label}</span>
                  {r.detail && <span className="text-[10px] text-[var(--text-muted)]">{r.detail}</span>}
                  <span className="text-[9px] text-[var(--text-muted)] uppercase">{r.type}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
