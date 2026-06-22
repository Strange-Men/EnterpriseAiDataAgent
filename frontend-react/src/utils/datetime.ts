/**
 * Date/time formatting utilities.
 *
 * All timestamps are stored as ISO 8601 UTC strings (with timezone suffix).
 * These helpers convert to the user's local timezone for display.
 */

/**
 * Format an ISO timestamp as local time (HH:MM).
 * Returns fallback for invalid input.
 */
export function formatLocalTime(iso: string | undefined | null, fallback = ""): string {
  if (!iso) return fallback;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Format an ISO timestamp as local date + time.
 * Returns fallback for invalid input.
 */
export function formatLocalDateTime(iso: string | undefined | null, fallback = ""): string {
  if (!iso) return fallback;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleString();
}

/**
 * Format an ISO timestamp as relative time ("3 分钟前", "2 hours ago").
 * Falls back to local date for older entries.
 */
export function formatRelativeTime(iso: string | undefined | null, fallback = ""): string {
  if (!iso) return fallback;
  const d = new Date(iso);
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
  return d.toLocaleDateString();
}
