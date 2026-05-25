"use client";

import { Dialog, DialogHeader, DialogTitle, DialogBody, DialogCloseButton } from "@/components/ui/dialog";
import { formatShortcutKey, type Shortcut } from "@/hooks/use-keyboard-shortcuts";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
  shortcuts: (Shortcut & { id: string })[];
}

export function KeyboardShortcutsModal({ open, onClose, shortcuts }: KeyboardShortcutsModalProps) {
  // Group by first word of description
  const groups = new Map<string, typeof shortcuts>();
  shortcuts.forEach((s) => {
    const group = s.description.split(" ")[0];
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(s);
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Keyboard Shortcuts</DialogTitle>
        <DialogCloseButton onClose={onClose} />
      </DialogHeader>
      <DialogBody>
        <div className="space-y-4">
          {Array.from(groups.entries()).map(([group, items]) => (
            <div key={group}>
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                {group}
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
