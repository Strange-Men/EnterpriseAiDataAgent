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
