"use client";

import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-4", className)}>
      <div>
        <h1 className="text-lg font-semibold text-[var(--text-secondary)]">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
