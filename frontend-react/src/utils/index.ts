export { cn } from "./cn";

/**
 * Truncate text and return display + full text for tooltip.
 */
export function truncate(text: string, maxLen: number = 20): { display: string; full: string; truncated: boolean } {
  if (text.length <= maxLen) {
    return { display: text, full: text, truncated: false };
  }
  return { display: text.slice(0, maxLen) + "...", full: text, truncated: true };
}

/**
 * Format a number with locale-appropriate separators.
 */
export function formatNumber(n: number, locale: string = "en"): string {
  return new Intl.NumberFormat(locale).format(n);
}

/**
 * Format bytes to human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
