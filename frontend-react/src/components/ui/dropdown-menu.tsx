"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export function DropdownMenu({
  trigger,
  children,
  align = "right",
  className,
  onOpenChange,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowDown" && menuRef.current) {
        e.preventDefault();
        const firstItem = menuRef.current.querySelector<HTMLElement>(
          '[role="menuitem"]'
        );
        firstItem?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => {
        setOpen((prev) => {
          const next = !prev;
          onOpenChange?.(next);
          return next;
        });
      }}>{trigger}</div>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className={cn(
            "absolute top-full mt-1 z-dropdown min-w-[160px]",
            "bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg shadow-ds-md",
            "py-1 animate-fade-in",
            align === "right" ? "right-0" : "left-0",
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({
  className,
  onClick,
  children,
  disabled,
  danger,
  title,
}: {
  className?: string;
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  title?: string;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors",
        "focus:outline-none focus:bg-[var(--bg-tertiary)]",
        disabled
          ? "opacity-50 cursor-not-allowed"
          : danger
            ? "text-[var(--error)] hover:bg-[var(--danger-subtle)]"
            : "text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]",
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 border-t border-[var(--border-default)]" />;
}

export function DropdownMenuLabel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "px-3 py-1 text-2xs font-semibold text-[var(--text-muted)] uppercase tracking-wider",
        className
      )}
    >
      {children}
    </div>
  );
}
