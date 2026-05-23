import { create } from "zustand";
import { persist } from "zustand/middleware";
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
      language: "en",
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
    { name: "workspace-settings" }
  )
);
