"use client";

import { useEffect, useCallback } from "react";

export interface Shortcut {
  key: string;
  mod?: "ctrl" | "ctrl+shift" | "alt";
  description: string;
  /** Optional group key for display grouping in shortcuts modal */
  group?: string;
  handler: () => void;
  /** If true, fires even when focus is in an input/textarea */
  global?: boolean;
}

export const SHORTCUTS = {
  COMMAND_PALETTE: "command-palette",
  GLOBAL_SEARCH: "global-search",
  NEW_INVESTIGATION: "new-investigation",
  TOGGLE_SIDEBAR: "toggle-sidebar",
  TOGGLE_THEME: "toggle-theme",
  FOCUS_MODE: "focus-mode",
  ESCAPE: "escape",
  GO_HOME: "go-home",
  GO_ANALYZE: "go-analyze",
  GO_DATA: "go-data",
  GO_QUERY: "go-query",
  GO_SETTINGS: "go-settings",
  OPEN_SHORTCUTS: "open-shortcuts",
} as const;

export type ShortcutId = (typeof SHORTCUTS)[keyof typeof SHORTCUTS];

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if ((el as HTMLElement).isContentEditable) return true;
  if (el.closest('[role="textbox"]')) return true;
  return false;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Find matching shortcut
      for (const s of shortcuts) {
        const keyMatch = e.key.toLowerCase() === s.key.toLowerCase();
        if (!keyMatch) continue;

        const ctrl = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;
        const alt = e.altKey;

        let modMatch = false;
        if (!s.mod) modMatch = !ctrl && !alt;
        else if (s.mod === "ctrl") modMatch = ctrl && !shift && !alt;
        else if (s.mod === "ctrl+shift") modMatch = ctrl && shift && !alt;
        else if (s.mod === "alt") modMatch = alt && !ctrl;

        if (!modMatch) continue;

        // Check input focus
        if (!s.global && isInputFocused()) continue;

        e.preventDefault();
        s.handler();
        return;
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export function formatShortcutKey(shortcut: { key: string; mod?: string }): string {
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().includes("MAC");
  const modKey = isMac ? "⌘" : "Ctrl";
  const parts: string[] = [];

  if (shortcut.mod) {
    if (shortcut.mod.includes("ctrl")) parts.push(modKey);
    if (shortcut.mod.includes("shift")) parts.push("Shift");
    if (shortcut.mod.includes("alt")) parts.push(isMac ? "⌥" : "Alt");
  }

  const key = shortcut.key === "Escape" ? "Esc" : shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
  parts.push(key);
  return parts.join(" + ");
}
