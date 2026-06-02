type LogLevel = "debug" | "info" | "warn" | "error";
type LogCategory = "api" | "query" | "ui" | "system" | "upload" | "store";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: unknown;
}

const MAX_LOGS = 500;
const logs: LogEntry[] = [];

function createEntry(
  level: LogLevel,
  category: LogCategory,
  message: string,
  data?: unknown
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    data,
  };
}

function push(entry: LogEntry) {
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs.shift();

  if (process.env.NODE_ENV === "production") return;

  const prefix = `[${entry.level.toUpperCase()}][${entry.category}]`;
  const fn =
    entry.level === "error"
      ? console.error
      : entry.level === "warn"
      ? console.warn
      : console.info;

  if (entry.data !== undefined) {
    fn(prefix, entry.message, entry.data);
  } else {
    fn(prefix, entry.message);
  }
}

export const logger = {
  debug(category: LogCategory, message: string, data?: unknown) {
    push(createEntry("debug", category, message, data));
  },
  info(category: LogCategory, message: string, data?: unknown) {
    push(createEntry("info", category, message, data));
  },
  warn(category: LogCategory, message: string, data?: unknown) {
    push(createEntry("warn", category, message, data));
  },
  error(category: LogCategory, message: string, data?: unknown) {
    push(createEntry("error", category, message, data));
  },

  /** Log an API call */
  api(method: string, url: string, status: number, ms: number) {
    const level: LogLevel = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
    push(
      createEntry(level, "api", `${method} ${url} → ${status} (${ms}ms)`)
    );
  },

  /** Log a SQL query execution */
  query(sql: string, rows: number, ms: number, error?: string) {
    const level: LogLevel = error ? "error" : "info";
    push(
      createEntry(
        level,
        "query",
        error ?? `OK (${rows} rows, ${ms}ms)`,
        { sql: sql.slice(0, 200), rows, ms }
      )
    );
  },

  /** Get recent logs */
  getRecent(count = 50): LogEntry[] {
    return logs.slice(-count);
  },

  /** Clear all logs */
  clear() {
    logs.length = 0;
  },
};
