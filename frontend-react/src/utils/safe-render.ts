/**
 * Safe rendering utilities for AI output.
 *
 * Prevents React crashes when LLM output contains objects, nulls,
 * or unexpected types that cannot be rendered as React children.
 */

/**
 * Convert any value to a safe display string.
 * Objects, arrays, and non-primitives return a fallback label.
 */
export function renderSafeText(value: unknown, fallback = ""): string {
  if (value == null) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

/**
 * Ensure a value is a string suitable for ReactMarkdown.
 * Returns fallback for non-string, empty, or object values.
 */
export function safeMarkdownContent(value: unknown, fallback = ""): string {
  if (typeof value === "string" && value.trim()) return value;
  return fallback;
}

/**
 * Ensure a value is an array (for map/forEach).
 * Returns empty array for non-array values.
 */
export function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Safely render an error value to string.
 * Handles Error objects, strings, and unknown types.
 */
export function safeErrorText(value: unknown): string {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    // Try to extract message from error-like objects
    const obj = value as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
    return "An unexpected error occurred";
  }
  return String(value ?? "An unexpected error occurred");
}
