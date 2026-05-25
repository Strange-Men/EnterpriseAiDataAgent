"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { cn } from "@/utils/cn";

interface InvestigationLayoutProps {
  context: ReactNode;
  main: ReactNode;
  tools: ReactNode;
}

export function InvestigationLayout({ context, main, tools }: InvestigationLayoutProps) {
  const { t } = useTranslation();
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsFocusMode(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toggleFocus = useCallback(() => {
    setIsFocusMode((prev) => !prev);
  }, []);

  if (isFocusMode) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-end px-3 py-1.5 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] shrink-0">
          <button
            onClick={toggleFocus}
            className="px-2 py-0.5 text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] border border-[var(--border-default)] rounded transition-colors"
          >
            {t("inv.exit-focus")}
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {main}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar: focus mode toggle */}
      <div className="flex items-center justify-end px-3 py-1 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] shrink-0">
        <button
          onClick={toggleFocus}
          className="px-2 py-0.5 text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] border border-[var(--border-default)] rounded transition-colors"
          title={t("inv.focus-mode")}
        >
          {t("inv.focus-mode")}
        </button>
      </div>

      {/* 3-zone layout */}
      <div className="flex-1 min-h-0">
        {isMobile ? (
          <div className="h-full overflow-y-auto p-4">{main}</div>
        ) : (
          <PanelGroup direction="horizontal" autoSaveId="investigation-layout">
            {/* Left: Context */}
            <Panel defaultSize={18} minSize={14} maxSize={28}>
              <div className="h-full overflow-y-auto border-r border-[var(--border-default)] bg-[var(--bg-secondary)]/50">
                {context}
              </div>
            </Panel>

            <PanelResizeHandle className="w-1 bg-[var(--border-default)] hover:bg-[var(--accent)] transition-colors cursor-col-resize" />

            {/* Center: Main — ultra-wide centering */}
            <Panel defaultSize={56} minSize={36}>
              <div className="h-full overflow-y-auto">
                <div className="max-w-[1200px] mx-auto">
                  {main}
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-1 bg-[var(--border-default)] hover:bg-[var(--accent)] transition-colors cursor-col-resize" />

            {/* Right: Tools — auto-collapse on laptop */}
            <Panel defaultSize={26} minSize={18} maxSize={36}>
              <div className="h-full overflow-y-auto border-l border-[var(--border-default)] bg-[var(--bg-secondary)]/50">
                {tools}
              </div>
            </Panel>
          </PanelGroup>
        )}
      </div>
    </div>
  );
}

function ResizeHandle() {
  return (
    <PanelResizeHandle className="w-1 bg-[var(--border-default)] hover:bg-[var(--accent)] transition-colors cursor-col-resize" />
  );
}
