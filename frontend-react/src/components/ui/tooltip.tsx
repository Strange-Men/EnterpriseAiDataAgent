"use client";

import { cn } from "@/utils/cn";

interface TooltipProps {
  text: string;
  fullText?: string;
  maxLen?: number;
  className?: string;
}

export function Tooltip({ text, fullText, maxLen = 20, className }: TooltipProps) {
  const display = fullText ?? text;
  const isTruncated = text.length > maxLen;
  const shown = isTruncated ? text.slice(0, maxLen) + "..." : text;

  return (
    <span
      data-tooltip={isTruncated ? display : undefined}
      className={cn(
        isTruncated && "cursor-help border-b border-dashed border-[var(--border-hover)] hover:border-[var(--accent)]",
        className
      )}
    >
      {shown}
    </span>
  );
}
