/**
 * Schedule Store - mirrors backend scheduled analysis tasks.
 *
 * Backend owns persistence and execution. The frontend keeps a small cached
 * view so the panel remains responsive between refreshes.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  createSchedule,
  deleteSchedule,
  listSchedules,
  toggleSchedule,
} from "@/services/api";
import { fetchTableData, fetchTableSchema } from "@/services/api/tables";

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
  isLoading: boolean;
  error: string | null;

  refreshTasks: () => Promise<void>;
  addTask: (task: Omit<ScheduledTask, "id" | "createdAt" | "lastRunAt" | "nextRunAt">) => Promise<string>;
  removeTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  addResult: (result: ScheduleResult) => void;
  getResultsForTask: (taskId: string) => ScheduleResult[];
}

type BackendTask = {
  id: string;
  name: string;
  question: string;
  table: string;
  interval: "hourly" | "daily" | "weekly";
  enabled: boolean;
  created_at?: string;
  last_run_at?: string | null;
  next_run_at?: string | null;
};

function normalizeTask(task: BackendTask): ScheduledTask {
  return {
    id: task.id,
    name: task.name,
    question: task.question,
    table: task.table,
    interval: task.interval,
    enabled: task.enabled,
    createdAt: task.created_at ?? new Date().toISOString(),
    lastRunAt: task.last_run_at ?? null,
    nextRunAt: task.next_run_at ?? null,
  };
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      tasks: [],
      results: [],
      isLoading: false,
      error: null,

      refreshTasks: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await listSchedules();
          const tasks = Array.isArray(res.tasks)
            ? (res.tasks as BackendTask[]).map(normalizeTask)
            : [];
          set({ tasks, isLoading: false });
        } catch (err) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : "Failed to load schedules",
          });
        }
      },

      addTask: async (task) => {
        set({ isLoading: true, error: null });
        try {
          const [schema, sample] = await Promise.all([
            fetchTableSchema(task.table).catch(() => []),
            fetchTableData(task.table, 10).catch(() => ({ data: [] })),
          ]);
          const res = await createSchedule({
            name: task.name,
            question: task.question,
            table: task.table,
            columns: schema,
            sample_rows: sample.data,
            interval: task.interval,
          });
          await get().refreshTasks();
          return res.task_id;
        } catch (err) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : "Failed to create schedule",
          });
          throw err;
        }
      },

      removeTask: async (id) => {
        await deleteSchedule(id);
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          results: state.results.filter((r) => r.taskId !== id),
        }));
      },

      toggleTask: async (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        await toggleSchedule(id, !task.enabled);
        await get().refreshTasks();
      },

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
      version: 2,
      migrate: (persisted: unknown) => {
        if (!persisted || typeof persisted !== "object") return { tasks: [], results: [] };
        const p = persisted as Record<string, unknown>;
        return {
          tasks: Array.isArray(p.tasks) ? p.tasks : [],
          results: Array.isArray(p.results) ? p.results : [],
          isLoading: false,
          error: null,
        };
      },
      partialize: (state) => ({
        tasks: state.tasks,
        results: state.results.slice(-50),
      }),
    }
  )
);
