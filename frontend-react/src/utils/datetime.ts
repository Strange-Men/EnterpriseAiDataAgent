/**
 * Date/time formatting utilities.
 *
 * All timestamps are stored as ISO 8601 UTC strings (with timezone suffix).
 * These helpers convert to the user's local timezone for display.
 *
 * IMPORTANT: All formatting uses manual getHours()/getMinutes()/etc. instead
 * of toLocaleTimeString()/toLocaleString() to produce locale-independent output.
 * This ensures stable HH:mm / YYYY-MM-DD HH:mm format regardless of CI locale.
 */

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatLocalTimeFromDate(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/**
 * Format an ISO timestamp as local time (HH:mm).
 * Uses the runtime's local timezone (user's browser).
 * Returns fallback for invalid input.
 */
export function formatLocalTime(value: string | Date | number | undefined | null, fallback = ""): string {
  if (value === null || value === undefined || value === "") return fallback;
  const d = new Date(value);
  if (isNaN(d.getTime())) return fallback;
  return formatLocalTimeFromDate(d);
}

/**
 * Format an ISO timestamp as local date + time (YYYY-MM-DD HH:mm).
 * Uses the runtime's local timezone (user's browser).
 * Returns fallback for invalid input.
 */
export function formatLocalDateTime(value: string | Date | number | undefined | null, fallback = ""): string {
  if (value === null || value === undefined || value === "") return fallback;
  const d = new Date(value);
  if (isNaN(d.getTime())) return fallback;
  return `${formatLocalDate(d)} ${formatLocalTimeFromDate(d)}`;
}

/**
 * Format an ISO timestamp as relative time ("< 1 min", "5 min", "3h", "2d").
 * Falls back to local date for older entries.
 */
export function formatRelativeTime(value: string | Date | number | undefined | null, fallback = ""): string {
  if (value === null || value === undefined || value === "") return fallback;
  const d = new Date(value);
  if (isNaN(d.getTime())) return fallback;
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 0) return fallback;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return formatLocalDate(d);
}
