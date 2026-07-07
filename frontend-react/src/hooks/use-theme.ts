"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      toggleTheme: () => set({ theme: "dark" }),
      setTheme: () => set({ theme: "dark" }),
    }),
    {
      name: "workspace-theme",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (_persisted: unknown, _version: number) => {
        return { theme: "dark" };
      },
    }
  )
);

export function applyTheme(_theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", "dark");
  try {
    localStorage.setItem("workspace-theme", JSON.stringify({ state: { theme: "dark" }, version: 1 }));
  } catch {
    // Ignore storage errors; the DOM theme is already dark.
  }
}
