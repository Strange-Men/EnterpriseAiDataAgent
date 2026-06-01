import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { generateId } from "@/utils/id";

export interface SavedQuery {
  id: string;
  name: string;
  sql: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SavedQueriesState {
  queries: SavedQuery[];

  saveQuery: (name: string, sql: string) => string;
  renameQuery: (id: string, name: string) => void;
  deleteQuery: (id: string) => void;
  toggleFavorite: (id: string) => void;
  updateQuery: (id: string, sql: string) => void;
  getFavorites: () => SavedQuery[];
}

export const useSavedQueriesStore = create<SavedQueriesState>()(
  persist(
    (set, get) => ({
      queries: [],

      saveQuery: (name: string, sql: string) => {
        const id = generateId();
        const now = new Date().toISOString();
        const query: SavedQuery = { id, name, sql, favorite: false, createdAt: now, updatedAt: now };
        set((state) => ({ queries: [query, ...state.queries] }));
        return id;
      },

      renameQuery: (id: string, name: string) => {
        set((state) => ({
          queries: state.queries.map((q) =>
            q.id === id ? { ...q, name, updatedAt: new Date().toISOString() } : q
          ),
        }));
      },

      deleteQuery: (id: string) => {
        set((state) => ({
          queries: state.queries.filter((q) => q.id !== id),
        }));
      },

      toggleFavorite: (id: string) => {
        set((state) => ({
          queries: state.queries.map((q) =>
            q.id === id ? { ...q, favorite: !q.favorite, updatedAt: new Date().toISOString() } : q
          ),
        }));
      },

      updateQuery: (id: string, sql: string) => {
        set((state) => ({
          queries: state.queries.map((q) =>
            q.id === id ? { ...q, sql, updatedAt: new Date().toISOString() } : q
          ),
        }));
      },

      getFavorites: () => {
        return get().queries.filter((q) => q.favorite);
      },
    }),
    {
      name: "saved-queries",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persisted: unknown, version: number) => {
        if (!persisted || typeof persisted !== "object") return { queries: [] };
        const p = persisted as Record<string, unknown>;
        if (version < 1) {
          return { queries: Array.isArray(p.queries) ? p.queries : [] };
        }
        return persisted as { queries: SavedQuery[] };
      },
    }
  )
);
