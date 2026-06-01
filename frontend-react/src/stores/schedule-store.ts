/**
 * Schedule Store — manages scheduled analysis tasks.
 *
 * Persists schedule configs to localStorage. Backend handles actual execution.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { generateId } from "@/utils/id";

export interface ScheduledTask {
  id: string;
  name: string;
  question: string;
  table: string;
  interval: "hourly" | "daily" | "weekly";
  enabled: boolean;
  createdAt: string;
  lastRunAt: string | null;
  nextRunAt: string | null;
}

export interface ScheduleResult {
  taskId: string;
  runId: string;
  status: "success" | "error";
  timestamp: string;
  error?: string;
}

interface ScheduleState {
  tasks: ScheduledTask[];
  results: ScheduleResult[];

  addTask: (task: Omit<ScheduledTask, "id" | "createdAt" | "lastRunAt" | "nextRunAt">) => string;
  removeTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addResult: (result: ScheduleResult) => void;
  getResultsForTask: (taskId: string) => ScheduleResult[];
}

function computeNextRun(interval: string): string {
  const now = new Date();
  switch (interval) {
    case "hourly": now.setHours(now.getHours() + 1); break;
    case "daily": now.setDate(now.getDate() + 1); break;
    case "weekly": now.setDate(now.getDate() + 7); break;
  }
  return now.toISOString();
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      tasks: [],
      results: [],

      addTask: (task) => {
        const id = generateId();
        const full: ScheduledTask = {
          ...task,
          id,
          createdAt: new Date().toISOString(),
          lastRunAt: null,
          nextRunAt: computeNextRun(task.interval),
        };
        set((state) => ({ tasks: [...state.tasks, full] }));
        return id;
      },

      removeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          results: state.results.filter((r) => r.taskId !== id),
        })),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, enabled: !t.enabled, nextRunAt: !t.enabled ? computeNextRun(t.interval) : null }
              : t
          ),
        })),

      addResult: (result) =>
        set((state) => {
          const results = [...state.results, result].slice(-50);
          const tasks = state.tasks.map((t) =>
            t.id === result.taskId ? { ...t, lastRunAt: result.timestamp } : t
          );
          return { results, tasks };
        }),

      getResultsForTask: (taskId) => get().results.filter((r) => r.taskId === taskId),
    }),
    {
      name: "schedule-tasks",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persisted: unknown, version: number) => {
        if (!persisted || typeof persisted !== "object") return { tasks: [], results: [] };
        const p = persisted as Record<string, unknown>;
        if (version < 1) {
          return {
            tasks: Array.isArray(p.tasks) ? p.tasks : [],
            results: Array.isArray(p.results) ? p.results : [],
          };
        }
        return persisted as { tasks: ScheduledTask[]; results: ScheduleResult[] };
      },
      partialize: (state) => ({
        tasks: state.tasks,
        results: state.results.slice(-50),
      }),
    }
  )
);
