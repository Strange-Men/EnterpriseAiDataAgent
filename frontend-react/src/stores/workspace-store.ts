import { create } from "zustand";
import type { Language, LayoutPreset, PanelId } from "@/types";

interface WorkspaceState {
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;

  // Layout
  layout: LayoutPreset;
  setLayout: (layout: LayoutPreset) => void;

  // Panel collapse
  collapsedPanels: Record<PanelId, boolean>;
  togglePanel: (panel: PanelId) => void;
  setPanelCollapsed: (panel: PanelId, collapsed: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
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
}));
