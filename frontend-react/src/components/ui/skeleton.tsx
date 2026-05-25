"use client";

interface SkeletonProps {
  className?: string;
  rows?: number;
}

export function Skeleton({ className = "", rows = 1 }: SkeletonProps) {
  if (rows > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={`animate-pulse rounded bg-[var(--bg-tertiary)] ${className}`}
            style={{ height: 16, opacity: 1 - i * 0.08 }}
          />
        ))}
      </div>
    );
  }
  return (
    <div
      className={`animate-pulse rounded bg-[var(--bg-tertiary)] ${className}`}
      style={{ height: 16 }}
    />
  );
}

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex gap-3 pb-2 border-b border-[var(--border-default)]">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded bg-[var(--bg-tertiary)] h-4"
            style={{ width: `${100 / cols}%`, maxWidth: 150 }}
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3 py-1.5"
          style={{ opacity: 1 - i * 0.05 }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="animate-pulse rounded bg-[var(--bg-tertiary)] h-3.5"
              style={{ width: `${100 / cols}%`, maxWidth: 150 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PanelSkeleton() {
  return (
    <div className="space-y-4 p-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
      <div className="pt-2">
        <Skeleton rows={5} className="h-3" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-secondary)]">
      <Skeleton className="h-4 w-1/3 mb-4" />
      <div className="animate-pulse rounded bg-[var(--bg-tertiary)] h-[280px]" />
    </div>
  );
}

export function StreamingSkeleton() {
  return (
    <div className="space-y-3">
      {/* Plan skeleton */}
      <div className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-secondary)]">
        <Skeleton className="h-4 w-24 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full animate-pulse bg-[var(--bg-tertiary)]" />
              <Skeleton className="h-3 flex-1" />
            </div>
          ))}
        </div>
      </div>
      {/* Step cards skeleton */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border border-[var(--border-default)] rounded-md p-3 bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full animate-pulse bg-[var(--bg-tertiary)]" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="mt-2 space-y-1">
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnalysisCardSkeleton() {
  return (
    <div className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-secondary)] space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton rows={3} className="h-2.5" />
    </div>
  );
}
