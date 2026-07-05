"use client";

import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type BadgeVariant = "success" | "warning" | "error" | "info" | "accent" | "muted";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "text-[var(--success)] bg-[var(--success-subtle)]",
  warning: "text-[var(--warning)] bg-[var(--warning-subtle)]",
  error: "text-[var(--error)] bg-[var(--danger-subtle)]",
  info: "text-[var(--info)] bg-[var(--info-subtle)]",
  accent: "text-[var(--accent)] bg-[var(--accent-subtle)]",
  muted: "text-[var(--text-muted)] bg-[var(--bg-tertiary)]",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "h-5 text-xs px-1.5",
  md: "h-6 text-xs px-2",
  lg: "h-7 text-sm px-2.5",
};

export function Badge({
  variant = "muted",
  size = "sm",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md font-medium leading-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}
