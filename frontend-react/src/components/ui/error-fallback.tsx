"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { cn } from "@/utils/cn";
import { safeErrorText } from "@/utils/safe-render";

import type { FallbackProps } from "react-error-boundary";

interface ErrorFallbackProps extends FallbackProps {
  className?: string;
}

export function ErrorFallback({ error, resetErrorBoundary, className }: ErrorFallbackProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[200px] p-8 text-center", className)}>
      <div className="w-12 h-12 mb-4 rounded-full bg-[var(--danger-subtle)] flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-[var(--error)]" />
      </div>
      <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Something went wrong</h2>
      <p className="text-xs text-[var(--text-muted)] max-w-md mb-4 break-words">
        {safeErrorText(error)}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
      >
        <RefreshCcw className="w-3.5 h-3.5" />
        Try Again
      </button>
    </div>
  );
}
