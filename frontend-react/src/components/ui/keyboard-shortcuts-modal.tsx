"use client";

import { Dialog, DialogHeader, DialogTitle, DialogBody, DialogCloseButton } from "@/components/ui/dialog";
import { formatShortcutKey, type Shortcut } from "@/hooks/use-keyboard-shortcuts";
import { useTranslation } from "react-i18next";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
  shortcuts: (Shortcut & { id: string })[];
}

const GROUP_ORDER = ["global", "navigation", "appearance"] as const;

export function KeyboardShortcutsModal({ open, onClose, shortcuts }: KeyboardShortcutsModalProps) {
  const { t } = useTranslation();

  // Group by the shortcut's group field
  const groups = new Map<string, typeof shortcuts>();
  const groupKeyFor = (s: (typeof shortcuts)[number]) => s.group || "global";
  shortcuts.forEach((s) => {
    const key = groupKeyFor(s);
    const arr = groups.get(key);
    if (arr) {
      arr.push(s);
    } else {
      groups.set(key, [s]);
    }
  });

  // Sort groups by predefined order
  const sortedGroups = Array.from(groups.entries()).sort(([a], [b]) => {
    const ai = GROUP_ORDER.indexOf(a as (typeof GROUP_ORDER)[number]);
    const bi = GROUP_ORDER.indexOf(b as (typeof GROUP_ORDER)[number]);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const groupLabel = (key: string) => {
    const map: Record<string, string> = {
      global: t("shortcut.group.global"),
      navigation: t("shortcut.group.navigation"),
      appearance: t("shortcut.group.appearance"),
    };
    return map[key] || key;
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>{t("shortcut.title")}</DialogTitle>
        <DialogCloseButton onClose={onClose} />
      </DialogHeader>
      <DialogBody>
        <div className="space-y-4">
          {sortedGroups.map(([group, items]) => (
            <div key={group}>
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                {groupLabel(group)}
              </p>
              <div className="space-y-0.5">
                {items.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-[var(--bg-tertiary)]"
                  >
                    <span className="text-xs text-[var(--text-secondary)]">{s.description}</span>
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded text-[var(--text-muted)]">
                      {formatShortcutKey(s)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogBody>
    </Dialog>
  );
}
