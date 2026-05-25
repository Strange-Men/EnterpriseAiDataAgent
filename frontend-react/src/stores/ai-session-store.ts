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
const MAX_KEY_FINDINGS = 10;

interface AiContextForApi {
  compressedSummary: string | null;
  recentTurns: AiTurn[];
  activeTable: string | null;
  lastColumns: string[] | null;
  lastRowCount: number | null;
  lastSql: string | null;
  keyFindings: string[];
  investigationSummary: string | null;
}

interface AiSessionState {
  turns: AiTurn[];
  activeTable: string | null;
  lastColumns: string[] | null;
  lastRowCount: number | null;
  lastSql: string | null;
  lastInsightSummary: string | null;
  compressedSummary: string | null;
  keyFindings: string[];
  investigationSummary: string | null;

  addUserTurn: (content: string) => void;
  addAssistantTurn: (content: string, sql?: string) => void;
  setContext: (ctx: { table?: string; columns?: string[]; rowCount?: number }) => void;
  getRecentTurns: (max?: number) => AiTurn[];
  getContextForApi: () => AiContextForApi;
  addKeyFinding: (finding: string) => void;
  setInvestigationSummary: (summary: string) => void;
  getContextForInsights: () => string | null;
  getContextForPlan: () => string[] | null;
  clear: () => void;
}

// ── Compression helper ──────────────────────────────────────────

function compressTurns(turns: AiTurn[]): { summary: string; keptTurns: AiTurn[] } {
  if (turns.length <= KEEP_TURNS) return { summary: "", keptTurns: turns };
  const older = turns.slice(0, -KEEP_TURNS);
  const recent = turns.slice(-KEEP_TURNS);
  // Structured compression: extract key info per turn
  const parts: string[] = [];
  for (const turn of older) {
    if (turn.role === "user") {
      const preview = turn.content.length > 120 ? turn.content.slice(0, 120) + "..." : turn.content;
      parts.push(`Q: ${preview}`);
    } else {
      if (turn.sql) parts.push(`SQL: ${turn.sql}`); // full SQL, not truncated
      // Extract first sentence as key finding
      const firstSentence = turn.content.split(/[.。!！]/)[0]?.trim();
      if (firstSentence) parts.push(`Finding: ${firstSentence.slice(0, 150)}`);
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
      keyFindings: [],
      investigationSummary: null,

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
          keyFindings: state.keyFindings,
          investigationSummary: state.investigationSummary,
        };
      },

      addKeyFinding: (finding) =>
        set((state) => {
          // Deduplicate: skip if already present (case-insensitive prefix match)
          const normalized = finding.toLowerCase().trim();
          if (state.keyFindings.some((f) => f.toLowerCase().trim() === normalized)) {
            return {};
          }
          const updated = [...state.keyFindings, finding];
          return { keyFindings: updated.slice(-MAX_KEY_FINDINGS) };
        }),

      setInvestigationSummary: (summary) => set({ investigationSummary: summary }),

      getContextForInsights: () => {
        const state = get();
        const parts: string[] = [];
        if (state.keyFindings.length > 0) {
          parts.push("Key Findings from prior analysis:");
          state.keyFindings.slice(0, 5).forEach((f, i) => {
            parts.push(`  ${i + 1}. ${f}`);
          });
        }
        if (state.investigationSummary) {
          parts.push(`\nInvestigation Summary:\n${state.investigationSummary}`);
        }
        return parts.length > 0 ? parts.join("\n") : null;
      },

      getContextForPlan: () => {
        const state = get();
        return state.keyFindings.length > 0 ? state.keyFindings.slice(0, 5) : null;
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
          keyFindings: [],
          investigationSummary: null,
        }),
    }),
    {
      name: "ai-session",
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        const p = persisted as Record<string, unknown>;
        if (!Array.isArray(p.turns)) return current;
        return { ...current, ...p };
      },
      partialize: (state) => ({
        turns: state.turns.slice(-KEEP_TURNS),
        compressedSummary: state.compressedSummary,
        activeTable: state.activeTable,
        lastColumns: state.lastColumns,
        lastRowCount: state.lastRowCount,
        lastSql: state.lastSql,
        lastInsightSummary: state.lastInsightSummary,
        keyFindings: state.keyFindings,
        investigationSummary: state.investigationSummary,
      }),
    }
  )
);
