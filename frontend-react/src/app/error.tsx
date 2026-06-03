"use client";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-3">
        <p className="text-xs uppercase tracking-wider text-red-400">Error</p>
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-xs text-[var(--text-muted)] break-words">
          {error.message || error.digest || "Unexpected application error"}
        </p>
        <button
          onClick={reset}
          className="px-3 py-1.5 text-xs rounded-md bg-[var(--accent)] text-[var(--bg-primary)]"
        >
          Retry
        </button>
      </div>
    </main>
  );
}
