/**
 * AI Session Store — conversation history + analysis context for multi-turn analysis.
 *
 * ONLY stores: conversation turns, context metadata (table, columns, rowCount).
 * FORBIDDEN: query result data copies, UI state, chart state, export state.
 * Full results live in sql-workspace-store.queryResult.
 */

import { create } from "zustand";
import { generateId } from "@/utils/id";

export interface AiTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  sql?: string;
  timestamp: string;
}

const MAX_TURNS = 20;

interface AiSessionState {
  turns: AiTurn[];
  activeTable: string | null;
  lastColumns: string[] | null;
  lastRowCount: number | null;
  lastSql: string | null;
  lastInsightSummary: string | null;

  addUserTurn: (content: string) => void;
  addAssistantTurn: (content: string, sql?: string) => void;
  setContext: (ctx: { table?: string; columns?: string[]; rowCount?: number }) => void;
  getRecentTurns: (max?: number) => AiTurn[];
  clear: () => void;
}

export const useAiSessionStore = create<AiSessionState>((set, get) => ({
  turns: [],
  activeTable: null,
  lastColumns: null,
  lastRowCount: null,
  lastSql: null,
  lastInsightSummary: null,

  addUserTurn: (content) =>
    set((state) => {
      const turn: AiTurn = {
        id: generateId(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      return { turns: [...state.turns, turn].slice(-MAX_TURNS) };
    }),

  addAssistantTurn: (content, sql) =>
    set((state) => {
      const turn: AiTurn = {
        id: generateId(),
        role: "assistant",
        content,
        sql,
        timestamp: new Date().toISOString(),
      };
      return {
        turns: [...state.turns, turn].slice(-MAX_TURNS),
        lastSql: sql ?? state.lastSql,
        lastInsightSummary: content,
      };
    }),

  setContext: (ctx) =>
    set({
      activeTable: ctx.table ?? get().activeTable,
      lastColumns: ctx.columns ?? get().lastColumns,
      lastRowCount: ctx.rowCount ?? get().lastRowCount,
    }),

  getRecentTurns: (max = 10) => {
    return get().turns.slice(-max);
  },

  clear: () =>
    set({
      turns: [],
      activeTable: null,
      lastColumns: null,
      lastRowCount: null,
      lastSql: null,
      lastInsightSummary: null,
    }),
}));
