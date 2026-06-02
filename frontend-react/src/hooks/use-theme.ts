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
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "workspace-theme",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persisted: unknown, _version: number) => {
        if (!persisted || typeof persisted !== "object") return { theme: "dark" };
        const p = persisted as Record<string, unknown>;
        const validTheme = p.theme === "light" || p.theme === "dark";
        return { theme: validTheme ? p.theme : "dark" };
      },
    }
  )
);

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}
