import type { AnomalyResult } from "@/types";
import { DIRECT_BACKEND } from "@/services/api/http-client";
import type { MultiStreamCallbacks, MultiStreamEvent, PlanStep } from "@/services/api/ai";

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (err: Error) => void;
}

export interface GenericStreamCallbacks {
  onEvent: (data: Record<string, unknown>) => void;
  onDone: (data?: Record<string, unknown>) => void;
  onError: (err: Error) => void;
}

export interface AnomalyStreamCallbacks {
  onDetection: (data: AnomalyResult) => void;
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (err: Error) => void;
}

function consumeSseStreamGeneric(
  createResponse: (signal: AbortSignal) => Promise<Response>,
  callbacks: GenericStreamCallbacks,
  timeoutMs = 120_000,
  maxRetries = 2
): AbortController {
  return consumeParsedSseStream(createResponse, callbacks, timeoutMs, maxRetries);
}

function consumeParsedSseStream(
  createResponse: (signal: AbortSignal) => Promise<Response>,
  callbacks: GenericStreamCallbacks,
  timeoutMs: number,
  maxRetries: number
): AbortController {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let retryTimerId: ReturnType<typeof setTimeout> | null = null;
  let retryCount = 0;
  let receivedEvents = false;
  let settled = false;

  const cleanupTimers = () => {
    if (timeoutId) clearTimeout(timeoutId);
    if (retryTimerId) clearTimeout(retryTimerId);
    timeoutId = null;
    retryTimerId = null;
  };

  const finishDone = (data?: Record<string, unknown>) => {
    if (settled) return;
    settled = true;
    cleanupTimers();
    callbacks.onDone(data);
  };

  const finishError = (err: Error) => {
    if (settled) return;
    settled = true;
    cleanupTimers();
    callbacks.onError(err);
  };

  const resetTimeout = () => {
    if (settled) return;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      finishError(new Error(`Stream timeout after ${timeoutMs / 1000}s of inactivity`));
      controller.abort();
    }, timeoutMs);
  };

  const handleData = (data: Record<string, unknown>) => {
    if (settled) return;
    if (data.type === "done") {
      finishDone(data);
    } else if (data.type === "error") {
      finishError(new Error((data.error as string) || "Unknown error"));
    } else {
      receivedEvents = true;
      callbacks.onEvent(data);
    }
  };

  const parseBuffer = (buffer: string) => {
    for (const line of buffer.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      try {
        handleData(JSON.parse(line.slice(6)));
      } catch {
        // Skip malformed SSE line.
      }
    }
  };

  const scheduleRetryOrFail = (err: Error) => {
    if (settled || controller.signal.aborted) return;
    if (!receivedEvents && retryCount < maxRetries) {
      retryCount++;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = null;
      console.warn(`[SSE] Stream failed, retrying (${retryCount}/${maxRetries})...`);
      retryTimerId = setTimeout(tryConnect, 1000 * retryCount);
    } else {
      finishError(err);
    }
  };

  const tryConnect = () => {
    if (settled || controller.signal.aborted) return;
    resetTimeout();
    createResponse(controller.signal).then(async (res) => {
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        finishError(new Error(`API ${res.status}: ${body || res.statusText}`));
        return;
      }
      if (!res.body) {
        finishError(new Error("Response body is null"));
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          resetTimeout();
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          parseBuffer(lines.join("\n"));
          if (settled) return;
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        buffer += decoder.decode();
        if (buffer.trim()) parseBuffer(buffer);
        if (!settled) {
          if (receivedEvents) {
            finishDone();
          } else {
            finishError(new Error("Stream ended without completion signal"));
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          scheduleRetryOrFail(err instanceof Error ? err : new Error("Stream failed"));
        }
      }
    }).catch((err) => {
      if (err.name !== "AbortError") {
        scheduleRetryOrFail(err instanceof Error ? err : new Error("Stream failed"));
      }
    });
  };

  controller.signal.addEventListener("abort", () => {
    cleanupTimers();
    settled = true;
  }, { once: true });

  tryConnect();
  return controller;
}

function consumeSseStream(
  createResponse: (signal: AbortSignal) => Promise<Response>,
  callbacks: StreamCallbacks,
  timeoutMs = 60_000,
  maxRetries = 2
): AbortController {
  return consumeParsedSseStream(
    createResponse,
    {
      onEvent: (data) => {
        if (data.type === "text") callbacks.onChunk((data.content as string) || "");
      },
      onDone: () => callbacks.onDone(),
      onError: callbacks.onError,
    },
    timeoutMs,
    maxRetries
  );
}

export function streamAiExplain(
  question: string,
  sql: string,
  results: Record<string, unknown>[],
  callbacks: StreamCallbacks,
  conversationHistory?: { role: string; content: string }[],
  language?: string
): AbortController {
  const body: Record<string, unknown> = { question, sql, results };
  if (conversationHistory) body.conversation_history = conversationHistory;
  if (language) body.language = language;
  return consumeSseStream(
    (signal) => fetch(`${DIRECT_BACKEND}/api/ai/explain/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    }),
    callbacks,
  );
}

export function streamAiInsights(
  question: string,
  results: Record<string, unknown>[],
  callbacks: StreamCallbacks,
  language?: string,
  priorContext?: string
): AbortController {
  const body: Record<string, unknown> = { question, results };
  if (language) body.language = language;
  if (priorContext) body.prior_context = priorContext;
  return consumeSseStream(
    (signal) => fetch(`${DIRECT_BACKEND}/api/ai/insights/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    }),
    callbacks,
  );
}

export function streamAiAnalyzeMulti(
  question: string,
  table: string,
  columns: { name: string; dtype: string }[],
  sampleRows: Record<string, unknown>[],
  callbacks: MultiStreamCallbacks,
  language?: string,
  maxRows: number = 500,
  priorFindings?: string[]
): AbortController {
  const body: Record<string, unknown> = { question, table, columns, sample_rows: sampleRows, max_rows: maxRows };
  if (language) body.language = language;
  if (priorFindings?.length) body.prior_findings = priorFindings;

  return consumeSseStreamGeneric(
    (signal) => fetch(`${DIRECT_BACKEND}/api/ai/analyze-multi/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    }),
    {
      onEvent: (data) => {
        const type = data.type as string;
        if (type === "plan" && data.plan) callbacks.onPlan(data.plan as PlanStep[]);
        else if (type === "step_start" && data.step != null) callbacks.onStepStart(data.step as number, (data.purpose as string) || "");
        else if (type === "step_retry" && data.step != null) callbacks.onStepRetry(data.step as number, (data.attempt as number) || 2, (data.error as string) || "");
        else if (type === "step_result") callbacks.onStepResult(data as unknown as MultiStreamEvent);
        else if (type === "summary" && data.summary != null) callbacks.onSummary(data.summary as string);
      },
      onDone: (data) => callbacks.onDone(data as unknown as MultiStreamEvent),
      onError: callbacks.onError,
    }
  );
}

export function streamAiDetectAnomalies(
  question: string,
  results: Record<string, unknown>[],
  callbacks: AnomalyStreamCallbacks,
  columns?: string[],
  method: string = "auto",
  language?: string
): AbortController {
  const body: Record<string, unknown> = { question, results, method };
  if (columns) body.columns = columns;
  if (language) body.language = language;

  return consumeSseStreamGeneric(
    (signal) => fetch(`${DIRECT_BACKEND}/api/ai/anomalies/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    }),
    {
      onEvent: (data) => {
        const type = data.type as string;
        if (type === "detection") callbacks.onDetection(data.data as unknown as AnomalyResult);
        else if (type === "text") callbacks.onChunk((data.content as string) || "");
      },
      onDone: () => callbacks.onDone(),
      onError: callbacks.onError,
    }
  );
}
