"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Home, Database, Code, MonitorPlay, Clock,
  Settings, FileText, Plus, Sun, Moon,
} from "lucide-react";
import { useAnalysisStore } from "@/stores/analysis-store";
import { useThemeStore } from "@/hooks/use-theme";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/utils/cn";

interface CommandGroup {
  label: string;
  items: CommandItem[];
}

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const allRuns = useAnalysisStore((s) => s.runs);
  const runs = useMemo(() => allRuns.slice(-8).reverse(), [allRuns]);
  const { theme, toggleTheme } = useThemeStore();
  const { language, toggleLanguage } = useLanguage();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const groups = useMemo<CommandGroup[]>(() => {
    const navItems: CommandItem[] = [
      { id: "home", label: "Go Home", icon: <Home className="w-4 h-4" />, action: () => router.push("/") },
      { id: "data", label: "Go to Data", icon: <Database className="w-4 h-4" />, action: () => router.push("/data") },
      { id: "query", label: "Go to Query", icon: <Code className="w-4 h-4" />, action: () => router.push("/query") },
      { id: "analyze", label: "Go to Analyze", icon: <MonitorPlay className="w-4 h-4" />, action: () => router.push("/analyze") },
      { id: "history", label: "Go to History", icon: <Clock className="w-4 h-4" />, action: () => router.push("/history") },
      { id: "settings", label: "Go to Settings", icon: <Settings className="w-4 h-4" />, action: () => router.push("/settings") },
    ];

    const actionItems: CommandItem[] = [
      { id: "new-investigation", label: "New Investigation", icon: <Plus className="w-4 h-4" />, action: () => router.push("/analyze") },
      { id: "toggle-theme", label: `Toggle Theme (${theme})`, icon: theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />, action: toggleTheme },
      { id: "toggle-language", label: `Switch Language (${language === "zh" ? "en" : "zh"})`, icon: <FileText className="w-4 h-4" />, action: toggleLanguage },
    ];

    const recentItems: CommandItem[] = runs.map((run) => ({
      id: run.id,
      label: run.question?.slice(0, 50) || run.mode || "Analysis",
      description: new Date(run.timestamp).toLocaleDateString(),
      icon: <Clock className="w-4 h-4" />,
      action: () => router.push(`/analyze/${run.id}`),
    }));

    return [
      { label: "Navigation", items: navItems },
      { label: "Actions", items: actionItems },
      ...(recentItems.length > 0 ? [{ label: "Recent", items: recentItems }] : []),
    ];
  }, [router, runs, theme, language, toggleTheme, toggleLanguage]);

  // Filter groups by query
  const filteredGroups = useMemo(() => {
    if (!query.trim()) return groups;
    const q = query.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  // Flatten for keyboard nav
  const allItems = useMemo(
    () => filteredGroups.flatMap((g) => g.items),
    [filteredGroups]
  );

  // Reset state on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = allItems[selectedIndex];
        if (item) {
          item.action();
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, selectedIndex, allItems, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-command flex items-start justify-center pt-[15vh]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative w-full max-w-lg mx-4 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl shadow-ds-lg overflow-hidden animate-slide-down">
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-default)]">
          <Search className="w-4 h-4 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded text-[var(--text-muted)]">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredGroups.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              No results found
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.label} className="mb-1">
                <p className="px-3 py-1 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const idx = allItems.indexOf(item);
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { item.action(); onClose(); }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm transition-colors",
                        isSelected
                          ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                          : "text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                      )}
                    >
                      <span className={cn(
                        "shrink-0",
                        isSelected ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
                      )}>
                        {item.icon}
                      </span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.description && (
                        <span className="text-[10px] text-[var(--text-muted)]">{item.description}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
