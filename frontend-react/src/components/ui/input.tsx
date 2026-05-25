"use client";

import { forwardRef, type ComponentProps } from "react";
import { cn } from "@/utils/cn";

const baseInputClasses =
  "w-full px-3 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-md text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-colors disabled:opacity-50 disabled:pointer-events-none";

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <input ref={ref} className={cn(baseInputClasses, className)} {...props} />
    );
  }
);

Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(baseInputClasses, "resize-y min-h-[80px]", className)}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, ComponentProps<"select">>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(baseInputClasses, "cursor-pointer appearance-none", className)}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
