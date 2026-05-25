"use client";

import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  const iconContent = typeof icon === "string" && icon ? icon : null;

  return (
    <div
      className={`flex flex-col items-center justify-center h-full min-h-[180px] p-6 text-center ${className}`}
    >
      <div className="w-14 h-14 mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-3xl text-[var(--text-muted)]">
        {iconContent || icon}
      </div>
      <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-[var(--text-muted)] mb-4 max-w-[260px]">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
