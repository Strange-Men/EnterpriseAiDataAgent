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
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let retryCount = 0;
  let receivedEvents = false;

  const resetTimeout = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      controller.abort();
      callbacks.onError(new Error(`Stream timeout after ${timeoutMs / 1000}s of inactivity`));
    }, timeoutMs);
  };

  const tryConnect = () => {
    resetTimeout();
    createResponse(controller.signal).then(async (res) => {
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        callbacks.onError(new Error(`API ${res.status}: ${body || res.statusText}`));
        return;
      }
      if (!res.body) {
        callbacks.onError(new Error("Response body is null"));
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let doneReceived = false;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          resetTimeout();
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "done") { doneReceived = true; if (timeoutId) clearTimeout(timeoutId); callbacks.onDone(data); return; }
                else if (data.type === "error") { doneReceived = true; if (timeoutId) clearTimeout(timeoutId); callbacks.onError(new Error(data.error || "Unknown error")); return; }
                else { receivedEvents = true; callbacks.onEvent(data); }
              } catch {
                // Skip malformed SSE line.
              }
            }
          }
        }
        if (timeoutId) clearTimeout(timeoutId);
        buffer += decoder.decode();
        if (buffer.trim()) {
          for (const line of buffer.split("\n")) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "done") { doneReceived = true; callbacks.onDone(data); }
                else if (data.type === "error") { doneReceived = true; callbacks.onError(new Error(data.error || "Unknown error")); }
                else { receivedEvents = true; callbacks.onEvent(data); }
              } catch {
                // Skip malformed SSE line.
              }
            }
          }
        }
        if (!doneReceived) {
          if (receivedEvents) {
            callbacks.onDone();
          } else {
            callbacks.onError(new Error("Stream ended without completion signal"));
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          if (!receivedEvents && retryCount < maxRetries) {
            retryCount++;
            console.warn(`[SSE] Stream failed, retrying (${retryCount}/${maxRetries})...`);
            setTimeout(tryConnect, 1000 * retryCount);
          } else {
            callbacks.onError(err instanceof Error ? err : new Error("Stream failed"));
          }
        }
      }
    }).catch((err) => {
      if (err.name !== "AbortError") {
        if (!receivedEvents && retryCount < maxRetries) {
          retryCount++;
          console.warn(`[SSE] Connection failed, retrying (${retryCount}/${maxRetries})...`);
          setTimeout(tryConnect, 1000 * retryCount);
        } else {
          callbacks.onError(err);
        }
      }
    });
  };

  tryConnect();
  return controller;
}

function consumeSseStream(
  createResponse: (signal: AbortSignal) => Promise<Response>,
  callbacks: StreamCallbacks,
  timeoutMs = 60_000,
  maxRetries = 2
): AbortController {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let retryCount = 0;
  let receivedChunks = false;

  const resetTimeout = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      controller.abort();
      callbacks.onError(new Error(`Stream timeout after ${timeoutMs / 1000}s of inactivity`));
    }, timeoutMs);
  };

  const tryConnect = () => {
    resetTimeout();
    createResponse(controller.signal).then(async (res) => {
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        callbacks.onError(new Error(`API ${res.status}: ${body || res.statusText}`));
        return;
      }
      if (!res.body) {
        callbacks.onError(new Error("Response body is null"));
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let doneReceived = false;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          resetTimeout();
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "text") { receivedChunks = true; callbacks.onChunk(data.content); }
                else if (data.type === "done") { doneReceived = true; if (timeoutId) clearTimeout(timeoutId); callbacks.onDone(); return; }
                else if (data.type === "error") { doneReceived = true; if (timeoutId) clearTimeout(timeoutId); callbacks.onError(new Error(data.error)); return; }
              } catch {
                // Skip malformed SSE line.
              }
            }
          }
        }
        if (timeoutId) clearTimeout(timeoutId);
        buffer += decoder.decode();
        if (buffer.trim()) {
          for (const line of buffer.split("\n")) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "text") { receivedChunks = true; callbacks.onChunk(data.content); }
                else if (data.type === "done") { doneReceived = true; callbacks.onDone(); }
                else if (data.type === "error") { doneReceived = true; callbacks.onError(new Error(data.error)); }
              } catch {
                // Skip malformed SSE line.
              }
            }
          }
        }
        if (!doneReceived) {
          if (receivedChunks) {
            callbacks.onDone();
          } else {
            callbacks.onError(new Error("Stream ended without completion signal"));
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          if (!receivedChunks && retryCount < maxRetries) {
            retryCount++;
            console.warn(`[SSE] Stream failed, retrying (${retryCount}/${maxRetries})...`);
            setTimeout(tryConnect, 1000 * retryCount);
          } else {
            callbacks.onError(err instanceof Error ? err : new Error("Stream failed"));
          }
        }
      }
    }).catch((err) => {
      if (err.name !== "AbortError") {
        if (!receivedChunks && retryCount < maxRetries) {
          retryCount++;
          console.warn(`[SSE] Connection failed, retrying (${retryCount}/${maxRetries})...`);
          setTimeout(tryConnect, 1000 * retryCount);
        } else {
          callbacks.onError(err);
        }
      }
    });
  };

  tryConnect();
  return controller;
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
