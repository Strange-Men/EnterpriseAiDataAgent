"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { ReactNode } from "react";

interface WorkspaceLayoutProps {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
}

const LAYOUT_SIZES: Record<string, [number, number, number]> = {
  default: [20, 45, 35],
  "left-wide": [30, 40, 30],
  "right-wide": [20, 40, 40],
  "center-focus": [15, 55, 30],
};

export function WorkspaceLayout({ left, center, right }: WorkspaceLayoutProps) {
  const { collapsedPanels, layout } = useWorkspaceStore();
  const sizes = LAYOUT_SIZES[layout] ?? LAYOUT_SIZES.default;

  return (
    <PanelGroup direction="horizontal" className="h-full">
      {/* Left Panel */}
      {!collapsedPanels.left && (
        <>
          <Panel
            defaultSize={sizes[0]}
            minSize={10}
            maxSize={40}
            collapsible
            className="overflow-hidden"
          >
            <div className="h-full overflow-y-auto p-4 bg-[var(--bg-secondary)] border-r border-[var(--border-default)]">
              {left}
            </div>
          </Panel>
          <PanelResizeHandle className="w-1 bg-[var(--border-default)] hover:bg-[var(--accent)] transition-colors cursor-col-resize" />
        </>
      )}

      {/* Center Panel */}
      <Panel defaultSize={sizes[1]} minSize={20} className="overflow-hidden">
        <div className="h-full overflow-y-auto p-4">
          {center}
        </div>
      </Panel>

      {/* Right Panel */}
      {!collapsedPanels.right && (
        <>
          <PanelResizeHandle className="w-1 bg-[var(--border-default)] hover:bg-[var(--accent)] transition-colors cursor-col-resize" />
          <Panel
            defaultSize={sizes[2]}
            minSize={15}
            maxSize={50}
            collapsible
            className="overflow-hidden"
          >
            <div className="h-full overflow-y-auto p-4 bg-[var(--bg-secondary)] border-l border-[var(--border-default)]">
              {right}
            </div>
          </Panel>
        </>
      )}
    </PanelGroup>
  );
}
