import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Language, LayoutPreset, PanelId } from "@/types";

interface WorkspaceState {
  language: Language;
  setLanguage: (lang: Language) => void;

  layout: LayoutPreset;
  setLayout: (layout: LayoutPreset) => void;

  collapsedPanels: Record<PanelId, boolean>;
  togglePanel: (panel: PanelId) => void;
  setPanelCollapsed: (panel: PanelId, collapsed: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      language: "zh",
      setLanguage: (language) => set({ language }),

      layout: "default",
      setLayout: (layout) => set({ layout }),

      collapsedPanels: { left: false, center: false, right: false },
      togglePanel: (panel) =>
        set((state) => ({
          collapsedPanels: {
            ...state.collapsedPanels,
            [panel]: !state.collapsedPanels[panel],
          },
        })),
      setPanelCollapsed: (panel, collapsed) =>
        set((state) => ({
          collapsedPanels: { ...state.collapsedPanels, [panel]: collapsed },
        })),
    }),
    {
      name: "workspace-settings",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persisted: unknown, version: number) => {
        if (!persisted || typeof persisted !== "object") return {};
        const p = persisted as Record<string, unknown>;
        if (version < 1) {
          const result: Record<string, unknown> = {};
          if (typeof p.language === "string") result.language = p.language;
          if (typeof p.layout === "string") result.layout = p.layout;
          if (p.collapsedPanels && typeof p.collapsedPanels === "object") result.collapsedPanels = p.collapsedPanels;
          return result;
        }
        return p;
      },
    }
  )
);
