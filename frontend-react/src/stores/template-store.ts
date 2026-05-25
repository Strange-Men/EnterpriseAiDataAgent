/**
 * Template Store — persists reusable analysis templates.
 *
 * Templates capture the structure of a completed analysis run so it can be
 * re-applied to different datasets with adapted questions.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { generateId } from "@/utils/id";
import type { AnalysisMode } from "@/stores/analysis-store";

const MAX_TEMPLATES = 20;

export interface TemplateStep {
  question: string;
  mode: AnalysisMode;
  order: number;
}

export interface AnalysisTemplate {
  id: string;
  name: string;
  description: string;
  steps: TemplateStep[];
  createdAt: string;
  sourceRunId: string;
  sourceTable: string;
}

interface TemplateState {
  templates: AnalysisTemplate[];

  addTemplate: (
    name: string,
    description: string,
    steps: TemplateStep[],
    sourceRunId: string,
    sourceTable: string
  ) => string;
  deleteTemplate: (id: string) => void;
  getTemplate: (id: string) => AnalysisTemplate | null;
  updateTemplate: (id: string, update: Partial<Pick<AnalysisTemplate, "name" | "description" | "steps">>) => void;
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: [],

      addTemplate: (name, description, steps, sourceRunId, sourceTable) => {
        const id = generateId();
        const template: AnalysisTemplate = {
          id,
          name,
          description,
          steps,
          createdAt: new Date().toISOString(),
          sourceRunId,
          sourceTable,
        };
        set((state) => {
          let templates = [template, ...state.templates];
          if (templates.length > MAX_TEMPLATES) {
            templates = templates.slice(0, MAX_TEMPLATES);
          }
          return { templates };
        });
        return id;
      },

      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),

      getTemplate: (id) => {
        return get().templates.find((t) => t.id === id) ?? null;
      },

      updateTemplate: (id, update) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...update } : t
          ),
        })),
    }),
    {
      name: "analysis-templates",
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        const p = persisted as Record<string, unknown>;
        if (!Array.isArray(p.templates)) return current;
        return { ...current, templates: p.templates };
      },
    }
  )
);
