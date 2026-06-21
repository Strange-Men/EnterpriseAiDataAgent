"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { safeErrorText } from "@/utils/safe-render";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error.message, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-8 text-center">
            <div className="w-12 h-12 mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="text-2xl">⚠</span>
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
              Something went wrong
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4 max-w-xs">
              {safeErrorText(this.state.error)}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-1.5 text-xs rounded bg-[var(--accent)] text-[#0E1117] font-medium hover:bg-[var(--accent-hover)] transition-colors"
            >
              Try Again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
