"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
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
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  // Compute menu position from trigger's bounding rect (portal-based)
  const computePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuW = 180; // approximate min-width
    const gap = 6;

    const top = rect.bottom + gap;

    let left: number;
    if (align === "right") {
      // Right-align: menu right edge = trigger right edge
      left = rect.right - menuW;
    } else {
      left = rect.left;
    }

    // Clamp to viewport
    const clampedLeft = Math.max(8, Math.min(left, window.innerWidth - menuW - 8));

    setMenuStyle({
      position: "fixed",
      top,
      left: clampedLeft,
      minWidth: menuW,
      zIndex: 2147483647,
    });
  }, [align]);

  useEffect(() => {
    if (!open) return;

    computePosition();

    // Recompute on scroll / resize
    const recompute = () => computePosition();
    window.addEventListener("scroll", recompute, true);
    window.addEventListener("resize", recompute);
    return () => {
      window.removeEventListener("scroll", recompute, true);
      window.removeEventListener("resize", recompute);
    };
  }, [open, computePosition]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // Ignore clicks on the trigger itself (handled by toggle)
      if (triggerRef.current?.contains(target)) return;
      // Ignore clicks inside the menu
      if (menuRef.current?.contains(target)) return;
      close();
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
      <div ref={triggerRef} onClick={() => {
        setOpen((prev) => {
          const next = !prev;
          onOpenChange?.(next);
          return next;
        });
      }}>{trigger}</div>

      {open && createPortal(
        <div
          ref={menuRef}
          role="menu"
          data-testid="history-record-menu"
          style={menuStyle}
          className={cn(
            "min-w-[160px]",
            "bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg shadow-ds-md",
            "py-1 animate-fade-in",
            className
          )}
        >
          {children}
        </div>,
        document.body
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
