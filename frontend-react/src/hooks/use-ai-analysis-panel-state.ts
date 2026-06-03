import { useCallback, useReducer, type Dispatch, type SetStateAction } from "react";
import type { MultiStepResult, EvaluationResult } from "@/services/api";
import type { AnalysisSection, TraceSnapshot } from "@/stores/analysis-store";
import type { ChartSpec } from "@/types";

export type ProgressInfo = {
  totalSteps: number;
  currentStep: number;
  startTime: number;
  stepSummaries: { step: number; purpose: string; rowCount?: number; elapsedMs?: number; status: "success" | "error" }[];
} | null;

type DrillDownFinding = { text: string; severity: string; index: number };
type SuggestedQuestion = { question: string; reason: string };

interface AnalysisPanelState {
  isLoading: boolean;
  error: string | null;
  sections: AnalysisSection[];
  rawData: unknown;
  hasRun: boolean;
  streamingContent: string | null;
  streamingError: string | null;
  chartSpecs: ChartSpec[];
  suggestedQuestions: SuggestedQuestion[];
  multiResult: MultiStepResult | null;
  trace: TraceSnapshot | null;
  followUpQuestion: string | null;
  drillDownFindings: DrillDownFinding[];
  evaluation: EvaluationResult | null;
  progressInfo: ProgressInfo;
  elapsedSeconds: number;
}

const initialState: AnalysisPanelState = {
  isLoading: false,
  error: null,
  sections: [],
  rawData: null,
  hasRun: false,
  streamingContent: null,
  streamingError: null,
  chartSpecs: [],
  suggestedQuestions: [],
  multiResult: null,
  trace: null,
  followUpQuestion: null,
  drillDownFindings: [],
  evaluation: null,
  progressInfo: null,
  elapsedSeconds: 0,
};

type Action<K extends keyof AnalysisPanelState = keyof AnalysisPanelState> = {
  key: K;
  value: SetStateAction<AnalysisPanelState[K]>;
};

function reducer(state: AnalysisPanelState, action: Action): AnalysisPanelState {
  const currentValue = state[action.key];
  const nextValue = typeof action.value === "function"
    ? (action.value as (value: typeof currentValue) => typeof currentValue)(currentValue)
    : action.value;
  return { ...state, [action.key]: nextValue };
}

function usePanelSetter<K extends keyof AnalysisPanelState>(
  dispatch: Dispatch<Action>,
  key: K
): Dispatch<SetStateAction<AnalysisPanelState[K]>> {
  return useCallback((value) => dispatch({ key, value }), [dispatch, key]);
}

export function useAiAnalysisPanelState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return {
    ...state,
    setIsLoading: usePanelSetter(dispatch, "isLoading"),
    setError: usePanelSetter(dispatch, "error"),
    setSections: usePanelSetter(dispatch, "sections"),
    setRawData: usePanelSetter(dispatch, "rawData"),
    setHasRun: usePanelSetter(dispatch, "hasRun"),
    setStreamingContent: usePanelSetter(dispatch, "streamingContent"),
    setStreamingError: usePanelSetter(dispatch, "streamingError"),
    setChartSpecs: usePanelSetter(dispatch, "chartSpecs"),
    setSuggestedQuestions: usePanelSetter(dispatch, "suggestedQuestions"),
    setMultiResult: usePanelSetter(dispatch, "multiResult"),
    setTrace: usePanelSetter(dispatch, "trace"),
    setFollowUpQuestion: usePanelSetter(dispatch, "followUpQuestion"),
    setDrillDownFindings: usePanelSetter(dispatch, "drillDownFindings"),
    setEvaluation: usePanelSetter(dispatch, "evaluation"),
    setProgressInfo: usePanelSetter(dispatch, "progressInfo"),
    setElapsedSeconds: usePanelSetter(dispatch, "elapsedSeconds"),
  };
}
