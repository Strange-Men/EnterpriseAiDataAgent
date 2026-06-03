export type ApiEnvelopeStatus = "success" | "error" | "partial";

export interface ApiErrorInfo {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponseEnvelope<TData> {
  status: ApiEnvelopeStatus;
  data: TData | null;
  error?: ApiErrorInfo | null;
  meta?: Record<string, unknown>;
}

export type AiResultStatus = "success" | "partial" | "fallback" | "error" | "low_confidence";

export interface AiQualityGate {
  name: string;
  passed: boolean;
  score?: number;
  message?: string;
}

export interface AiResultEnvelope<TData> {
  status: AiResultStatus;
  data: TData | null;
  fallback?: string | null;
  error?: ApiErrorInfo | null;
  quality_gates?: AiQualityGate[];
  trace?: Record<string, unknown> | null;
  partial_data?: Record<string, unknown> | null;
}

export function isApiResponseEnvelope<TData>(value: unknown): value is ApiResponseEnvelope<TData> {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { status?: unknown; data?: unknown };
  return typeof candidate.status === "string" && "data" in candidate;
}

export function unwrapApiResponse<TData>(value: TData | ApiResponseEnvelope<TData>): TData {
  if (isApiResponseEnvelope<TData>(value)) {
    if (value.status === "error") {
      throw new Error(value.error?.message || "API request failed");
    }
    return value.data as TData;
  }
  return value;
}
