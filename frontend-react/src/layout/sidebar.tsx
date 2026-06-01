"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/cn";
import { House, Database, Code, MonitorPlay, Clock, Settings } from "lucide-react";

interface NavItem {
  id: string;
  labelKey: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", labelKey: "nav.home", href: "/", icon: <House className="w-4 h-4" /> },
  { id: "data", labelKey: "nav.data", href: "/data", icon: <Database className="w-4 h-4" /> },
  { id: "query", labelKey: "nav.query", href: "/query", icon: <Code className="w-4 h-4" /> },
  { id: "analyze", labelKey: "nav.analyze", href: "/analyze", icon: <MonitorPlay className="w-4 h-4" /> },
  { id: "history", labelKey: "nav.history", href: "/history", icon: <Clock className="w-4 h-4" /> },
  { id: "settings", labelKey: "nav.settings", href: "/settings", icon: <Settings className="w-4 h-4" /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <aside className="flex flex-col h-full bg-[var(--bg-secondary)] border-r border-[var(--border-default)]">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-[var(--border-default)]">
        <h1 className="text-sm font-bold text-[var(--accent)] tracking-wide truncate">
          EAI
        </h1>
        <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
          Data Agent
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
            || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-colors text-left",
                isActive
                  ? "bg-[var(--accent)]/10 text-[var(--accent)] font-medium"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
              )}
            >
              <span className={cn(
                "shrink-0",
                isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
              )}>
                {item.icon}
              </span>
              <span className="truncate">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-[var(--border-default)]">
        <p className="text-[10px] text-[var(--text-muted)] text-center">
          v0.9.0
        </p>
      </div>
    </aside>
  );
}
