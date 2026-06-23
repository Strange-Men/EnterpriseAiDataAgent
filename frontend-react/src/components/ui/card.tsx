"use client";

import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";

type CardVariant = "default" | "bordered" | "highlighted";

interface CardProps extends ComponentProps<"div"> {
  variant?: CardVariant;
}

const cardVariants: Record<CardVariant, string> = {
  default: "bg-[var(--bg-secondary)] border border-[var(--border-default)]",
  bordered: "bg-[var(--bg-secondary)] border-2 border-[var(--border-default)]",
  highlighted:
    "bg-[var(--bg-secondary)] border border-[var(--border-default)] border-l-[var(--accent)] border-l-2",
};

export function Card({
  variant = "default",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg transition-colors",
        cardVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "px-4 py-3 border-b border-[var(--border-default)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "text-sm font-semibold text-[var(--accent)] uppercase tracking-wider",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: ComponentProps<"p">) {
  return (
    <p
      className={cn("text-xs text-[var(--text-muted)] mt-0.5", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("px-4 py-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "px-4 py-2 border-t border-[var(--border-default)] text-xs text-[var(--text-muted)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
