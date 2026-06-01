/**
 * Investigation Store — unified analysis lifecycle + AI context.
 *
 * Replaces: workflow-store + ai-session-store.
 *
 * Single source of truth for:
 *   - Analysis lifecycle (stage, source, startedAt)
 *   - AI conversation (turns, compressedSummary)
 *   - Findings & knowledge (keyFindings, investigationSummary)
 *   - Drill-down chain (drillChain)
 *   - Active context (activeTable, activeRunId)
 *   - Metadata (lastSql, lastColumns, lastRowCount)
 *
 * Persisted to localStorage key "investigation".
 * Auto-migrates from legacy "ai-session" key on first load.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { generateId } from "@/utils/id";

// ── Types ───────────────────────────────────────────────────────────

export type InvestigationStage =
  | "idle"
  | "uploading"
  | "profiling"
  | "analyzing"
  | "sql-ready"
  | "executing"
  | "done";

export interface AiTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  sql?: string;
  timestamp: string;
}

export interface AiContextForApi {
  compressedSummary: string | null;
  recentTurns: AiTurn[];
  activeTable: string | null;
  lastColumns: string[] | null;
  lastRowCount: number | null;
  lastSql: string | null;
  keyFindings: string[];
  investigationSummary: string | null;
}

// ── Constants ───────────────────────────────────────────────────────

const KEEP_TURNS = 8;
const COMPRESS_AT = 15;
const MAX_KEY_FINDINGS = 10;
const MAX_DRILL_CHAIN = 20;
const LEGACY_KEY = "ai-session";
const NEW_KEY = "investigation";

// ── Compression helper ──────────────────────────────────────────────

function compressTurns(turns: AiTurn[]): { summary: string; keptTurns: AiTurn[] } {
  if (turns.length <= KEEP_TURNS) return { summary: "", keptTurns: turns };
  const older = turns.slice(0, -KEEP_TURNS);
  const recent = turns.slice(-KEEP_TURNS);
  const parts: string[] = [];
  for (const turn of older) {
    if (turn.role === "user") {
      const preview = turn.content.length > 120 ? turn.content.slice(0, 120) + "..." : turn.content;
      parts.push(`Q: ${preview}`);
    } else {
      if (turn.sql) parts.push(`SQL: ${turn.sql}`);
      const firstSentence = turn.content.split(/[.。!！]/)[0]?.trim();
      if (firstSentence) parts.push(`Finding: ${firstSentence.slice(0, 150)}`);
    }
  }
  return { summary: parts.join("\n"), keptTurns: recent };
}

// ── Legacy migration (module-level, runs once) ──────────────────────

function migrateFromLegacy(): void {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;
    const p = parsed as Record<string, unknown>;
    if (!Array.isArray(p.turns)) return;

    const migrated: Record<string, unknown> = {};
    if (Array.isArray(p.turns)) migrated.turns = (p.turns as AiTurn[]).slice(-KEEP_TURNS);
    if (typeof p.compressedSummary === "string") migrated.compressedSummary = p.compressedSummary;
    if (typeof p.activeTable === "string") migrated.activeTable = p.activeTable;
    if (Array.isArray(p.lastColumns)) migrated.lastColumns = p.lastColumns;
    if (typeof p.lastRowCount === "number") migrated.lastRowCount = p.lastRowCount;
    if (typeof p.lastSql === "string") migrated.lastSql = p.lastSql;
    if (typeof p.lastInsightSummary === "string") migrated.lastInsightSummary = p.lastInsightSummary;
    if (Array.isArray(p.keyFindings)) migrated.keyFindings = p.keyFindings;
    if (typeof p.investigationSummary === "string") migrated.investigationSummary = p.investigationSummary;

    // Write to new key and remove legacy
    if (Object.keys(migrated).length > 0) {
      localStorage.setItem(NEW_KEY, JSON.stringify({ state: migrated, version: 0 }));
    }
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // Silently ignore migration errors
  }
}

// ── Store interface ─────────────────────────────────────────────────

interface InvestigationState {
  // Lifecycle
  stage: InvestigationStage;
  source: "upload" | "manual" | null;
  startedAt: string | null;

  // Active context (reference)
  activeTable: string | null;

  // AI conversation
  turns: AiTurn[];
  compressedSummary: string | null;

  // Knowledge
  keyFindings: string[];
  investigationSummary: string | null;

  // Metadata
  lastSql: string | null;
  lastColumns: string[] | null;
  lastRowCount: number | null;
  lastInsightSummary: string | null;

  // Drill-down chain
  drillChain: string[];

  // ── Lifecycle actions ───────────────────────────────────────────

  advance: (stage: InvestigationStage, opts?: { table?: string; sql?: string }) => void;
  reset: () => void;

  // ── Conversation actions ────────────────────────────────────────

  addUserTurn: (content: string) => void;
  addAssistantTurn: (content: string, sql?: string) => void;
  setContext: (ctx: { table?: string | null; columns?: string[]; rowCount?: number }) => void;
  getRecentTurns: (max?: number) => AiTurn[];
  getContextForApi: () => AiContextForApi;

  // ── Knowledge actions ───────────────────────────────────────────

  addKeyFinding: (finding: string) => void;
  setInvestigationSummary: (summary: string) => void;
  getContextForInsights: () => string | null;
  getContextForPlan: () => string[] | null;

  // ── Investigation actions (new) ─────────────────────────────────

  addToDrillChain: (runId: string) => void;

  // ── Reset ───────────────────────────────────────────────────────

  clear: () => void;

  // ── Recovery ────────────────────────────────────────────────────

  recoverStaleStage: () => void;
}

// ── Migrate before store creation ───────────────────────────────────

migrateFromLegacy();

// ── Store ───────────────────────────────────────────────────────────

export const useInvestigationStore = create<InvestigationState>()(
  persist(
    (set, get) => ({
      // Lifecycle
      stage: "idle",
      source: null,
      startedAt: null,

      // Context
      activeTable: null,

      // Conversation
      turns: [],
      compressedSummary: null,

      // Knowledge
      keyFindings: [],
      investigationSummary: null,

      // Metadata
      lastSql: null,
      lastColumns: null,
      lastRowCount: null,
      lastInsightSummary: null,

      // Drill-down
      drillChain: [],

      // ── Lifecycle actions ───────────────────────────────────────

      advance: (stage, opts) =>
        set((state) => ({
          stage,
          activeTable: opts?.table ?? state.activeTable,
          lastSql: opts?.sql ?? state.lastSql,
          startedAt: state.startedAt ?? new Date().toISOString(),
          source: state.source ?? (stage === "uploading" ? "upload" : "manual"),
        })),

      reset: () =>
        set({
          stage: "idle",
          activeTable: null,
          lastSql: null,
          startedAt: null,
          source: null,
          drillChain: [],
        }),

      // ── Conversation actions ────────────────────────────────────

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
          activeTable: ctx.table !== undefined ? ctx.table : get().activeTable,
          lastColumns: ctx.columns ?? get().lastColumns,
          lastRowCount: ctx.rowCount ?? get().lastRowCount,
        }),

      getRecentTurns: (max = 10) => get().turns.slice(-max),

      getContextForApi: () => {
        const s = get();
        return {
          compressedSummary: s.compressedSummary,
          recentTurns: s.turns.slice(-10),
          activeTable: s.activeTable,
          lastColumns: s.lastColumns,
          lastRowCount: s.lastRowCount,
          lastSql: s.lastSql,
          keyFindings: s.keyFindings,
          investigationSummary: s.investigationSummary,
        };
      },

      // ── Knowledge actions ───────────────────────────────────────

      addKeyFinding: (finding) =>
        set((state) => {
          const normalized = finding.toLowerCase().trim();
          if (state.keyFindings.some((f) => f.toLowerCase().trim() === normalized)) {
            return {};
          }
          const updated = [...state.keyFindings, finding];
          return { keyFindings: updated.slice(-MAX_KEY_FINDINGS) };
        }),

      setInvestigationSummary: (summary) => set({ investigationSummary: summary }),

      getContextForInsights: () => {
        const s = get();
        const parts: string[] = [];
        if (s.keyFindings.length > 0) {
          parts.push("Key Findings from prior analysis:");
          s.keyFindings.slice(0, 5).forEach((f, i) => {
            parts.push(`  ${i + 1}. ${f}`);
          });
        }
        if (s.investigationSummary) {
          parts.push(`\nInvestigation Summary:\n${s.investigationSummary}`);
        }
        return parts.length > 0 ? parts.join("\n") : null;
      },

      getContextForPlan: () => {
        const s = get();
        return s.keyFindings.length > 0 ? s.keyFindings.slice(0, 5) : null;
      },

      // ── Investigation actions (new) ─────────────────────────────

      addToDrillChain: (runId) =>
        set((state) => {
          const chain = [...state.drillChain, runId];
          return { drillChain: chain.slice(-MAX_DRILL_CHAIN) };
        }),

      // ── Reset ───────────────────────────────────────────────────

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
          drillChain: [],
        }),

      // ── Recovery ──────────────────────────────────────────────────

      recoverStaleStage: () => {
        const { stage } = get();
        const transientStages: InvestigationStage[] = ["uploading", "profiling", "analyzing", "executing"];
        if (transientStages.includes(stage)) {
          set({ stage: "idle" });
        }
      },
    }),
    {
      name: NEW_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persisted: unknown, version: number) => {
        if (!persisted || typeof persisted !== "object") return {};
        const p = persisted as Record<string, unknown>;
        // Version 0 → 1: validate shape, pass through valid fields
        if (version < 1) {
          const result: Record<string, unknown> = {};
          if (Array.isArray(p.turns)) result.turns = p.turns;
          if (typeof p.stage === "string") result.stage = p.stage;
          if (typeof p.source === "string") result.source = p.source;
          if (typeof p.startedAt === "string") result.startedAt = p.startedAt;
          if (typeof p.activeTable === "string") result.activeTable = p.activeTable;
          if (typeof p.compressedSummary === "string") result.compressedSummary = p.compressedSummary;
          if (Array.isArray(p.keyFindings)) result.keyFindings = p.keyFindings;
          if (typeof p.investigationSummary === "string") result.investigationSummary = p.investigationSummary;
          if (typeof p.lastSql === "string") result.lastSql = p.lastSql;
          if (Array.isArray(p.lastColumns)) result.lastColumns = p.lastColumns;
          if (typeof p.lastRowCount === "number") result.lastRowCount = p.lastRowCount;
          if (typeof p.lastInsightSummary === "string") result.lastInsightSummary = p.lastInsightSummary;
          if (Array.isArray(p.drillChain)) result.drillChain = p.drillChain;
          return result;
        }
        return p;
      },
      onRehydrateStorage: () => (state) => {
        if (state) state.recoverStaleStage();
      },
      partialize: (state) => ({
        stage: state.stage,
        source: state.source,
        startedAt: state.startedAt,
        activeTable: state.activeTable,
        turns: state.turns.slice(-KEEP_TURNS),
        compressedSummary: state.compressedSummary,
        keyFindings: state.keyFindings,
        investigationSummary: state.investigationSummary,
        lastSql: state.lastSql,
        lastColumns: state.lastColumns,
        lastRowCount: state.lastRowCount,
        lastInsightSummary: state.lastInsightSummary,
        drillChain: state.drillChain,
      }),
    }
  )
);
