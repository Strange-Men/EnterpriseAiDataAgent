# Analysis Workspace Skill

> v0.5.6 — Dedicated AI analysis workspace panel with session history and trace visualization.

## What It Does

Adds a first-class "Analysis" tab to the right panel of the workspace layout. Shows:
- **Session History** — list of past AI analysis runs, persisted across page refresh
- **Active Run Detail** — sections, charts, multi-step results from the selected run
- **Trace Inspector** — collapsible timeline of backend LLM calls with latency bars and token counts

## Architecture

```
analysis-store.ts (persisted Zustand store)
  ├── AnalysisRun: { id, mode, question, table, sections, chartSpecs, multiResult, trace }
  ├── TraceSnapshot: { trace_id, events[], token totals, guardrail_violations }
  └── MAX_HISTORY = 20

ai-analysis-panel.tsx (orchestrator)
  ├── calls analysisStore.addRun() on start
  ├── calls analysisStore.updateRun() on complete/error
  └── extracts trace from streamAiAnalyzeMulti onDone event

analysis-workspace-panel.tsx (right panel tab)
  ├── reads from analysisStore
  └── renders: HistoryList → RunDetail → TraceTimeline
```

## Key Files

| File | Purpose |
|------|---------|
| `frontend-react/src/stores/analysis-store.ts` | Persisted store for run history + trace |
| `frontend-react/src/panels/analysis-workspace-panel.tsx` | Right panel tab component |
| `frontend-react/src/panels/ai-analysis-panel.tsx` | Orchestrator (records runs in store) |
| `frontend-react/src/components/ai/trace-timeline.tsx` | Trace event visualization |
| `frontend-react/src/components/ai/analysis-section.tsx` | Markdown section renderer |
| `frontend-react/src/components/ai/step-results.tsx` | Multi-step result cards |
| `frontend-react/src/components/ai/analysis-header.tsx` | Header bar with mode/actions |
| `frontend-react/src/components/ai/follow-up-input.tsx` | Follow-up question input |

## How It Works

1. User runs any AI analysis (Explain, Insights, Full Analysis, Autonomous)
2. `AIAnalysisPanel` calls `analysisStore.addRun()` — creates a running entry
3. On completion, `analysisStore.updateRun()` stores sections, charts, trace
4. Analysis tab in right panel shows the run in history list
5. Click a history item to view its full result + trace
6. History persists across page refresh (Zustand persist)

## Trace Data Flow

Backend `TraceRecorder` → SSE done event → `MultiStreamEvent.trace` → `analysisStore.updateRun({ trace })` → `TraceTimeline` component

## Constraints

- `workflow-store` is NOT modified — analysis store is separate
- No new backend endpoints — uses existing trace data from done events
- MAX_HISTORY=20 prevents store bloat
- Follow-up input only works when `onSqlGenerated` callback is provided
