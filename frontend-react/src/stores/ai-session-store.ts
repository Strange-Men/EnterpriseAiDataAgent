/**
 * AI Session Store — conversation history + analysis context for multi-turn analysis.
 *
 * ONLY stores: conversation turns, context metadata (table, columns, rowCount).
 * FORBIDDEN: query result data copies, UI state, chart state, export state.
 * Full results live in sql-workspace-store.queryResult.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { generateId } from "@/utils/id";

export interface AiTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  sql?: string;
  timestamp: string;
}

const MAX_TURNS = 20;
const KEEP_TURNS = 8; // turns kept verbatim after compression
const COMPRESS_AT = 15; // compress when turns exceed this count

interface AiContextForApi {
  compressedSummary: string | null;
  recentTurns: AiTurn[];
  activeTable: string | null;
  lastColumns: string[] | null;
  lastRowCount: number | null;
  lastSql: string | null;
}

interface AiSessionState {
  turns: AiTurn[];
  activeTable: string | null;
  lastColumns: string[] | null;
  lastRowCount: number | null;
  lastSql: string | null;
  lastInsightSummary: string | null;
  compressedSummary: string | null;

  addUserTurn: (content: string) => void;
  addAssistantTurn: (content: string, sql?: string) => void;
  setContext: (ctx: { table?: string; columns?: string[]; rowCount?: number }) => void;
  getRecentTurns: (max?: number) => AiTurn[];
  getContextForApi: () => AiContextForApi;
  clear: () => void;
}

// ── Compression helper ──────────────────────────────────────────

function compressTurns(turns: AiTurn[]): { summary: string; keptTurns: AiTurn[] } {
  if (turns.length <= KEEP_TURNS) return { summary: "", keptTurns: turns };
  const older = turns.slice(0, -KEEP_TURNS);
  const recent = turns.slice(-KEEP_TURNS);
  // Build summary from older turns: extract key user questions and SQL
  const parts: string[] = [];
  for (const turn of older) {
    if (turn.role === "user") {
      const preview = turn.content.length > 80 ? turn.content.slice(0, 80) + "..." : turn.content;
      parts.push(`Q: ${preview}`);
    } else if (turn.sql) {
      parts.push(`SQL: ${turn.sql.slice(0, 100)}`);
    }
  }
  return { summary: parts.join("\n"), keptTurns: recent };
}

// ── Store ─────────────────────────────────────────────────────────

export const useAiSessionStore = create<AiSessionState>()(
  persist(
    (set, get) => ({
      turns: [],
      activeTable: null,
      lastColumns: null,
      lastRowCount: null,
      lastSql: null,
      lastInsightSummary: null,
      compressedSummary: null,

      addUserTurn: (content) =>
        set((state) => {
          const turn: AiTurn = {
            id: generateId(),
            role: "user",
            content,
            timestamp: new Date().toISOString(),
          };
          const allTurns = [...state.turns, turn];
          if (allTurns.length <= COMPRESS_AT) return { turns: allTurns };
          const { summary, keptTurns } = compressTurns(allTurns);
          return { turns: keptTurns, compressedSummary: summary || state.compressedSummary };
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
          const allTurns = [...state.turns, turn];
          if (allTurns.length <= COMPRESS_AT) {
            return {
              turns: allTurns,
              lastSql: sql ?? state.lastSql,
              lastInsightSummary: content,
            };
          }
          const { summary, keptTurns } = compressTurns(allTurns);
          return {
            turns: keptTurns,
            compressedSummary: summary || state.compressedSummary,
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

      getContextForApi: () => {
        const state = get();
        return {
          compressedSummary: state.compressedSummary,
          recentTurns: state.turns.slice(-10),
          activeTable: state.activeTable,
          lastColumns: state.lastColumns,
          lastRowCount: state.lastRowCount,
          lastSql: state.lastSql,
        };
      },

      clear: () =>
        set({
          turns: [],
          activeTable: null,
          lastColumns: null,
          lastRowCount: null,
          lastSql: null,
          lastInsightSummary: null,
          compressedSummary: null,
        }),
    }),
    {
      name: "ai-session",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        turns: state.turns.slice(-KEEP_TURNS),
        compressedSummary: state.compressedSummary,
        activeTable: state.activeTable,
        lastColumns: state.lastColumns,
        lastRowCount: state.lastRowCount,
        lastSql: state.lastSql,
        lastInsightSummary: state.lastInsightSummary,
      }),
    }
  )
);
