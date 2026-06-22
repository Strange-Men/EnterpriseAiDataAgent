interface QueryTab {
  id: string;
  name: string;
}

interface QueryTabsBarProps {
  tabs: QueryTab[];
  activeTabId: string;
  renamingTabId: string | null;
  renameValue: string;
  addLabel: string;
  onActivate: (tabId: string) => void;
  onAdd: () => void;
  onRemove: (tabId: string) => void;
  onStartRename: (tabId: string, name: string) => void;
  onRenameValueChange: (value: string) => void;
  onRenameCommit: (tabId: string) => void;
  onRenameCancel: () => void;
}

export function QueryTabsBar({
  tabs,
  activeTabId,
  renamingTabId,
  renameValue,
  addLabel,
  onActivate,
  onAdd,
  onRemove,
  onStartRename,
  onRenameValueChange,
  onRenameCommit,
  onRenameCancel,
}: QueryTabsBarProps) {
  return (
    <div className="flex items-center gap-1 pb-2 mb-2 border-b border-[var(--border-default)] overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`group flex items-center gap-1 px-2.5 py-1 rounded-md text-xs cursor-pointer transition-colors flex-shrink-0 ${
            tab.id === activeTabId
              ? "bg-[var(--accent)] text-[var(--bg-primary)] font-medium"
              : "bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
          }`}
          onClick={() => onActivate(tab.id)}
        >
          {renamingTabId === tab.id ? (
            <input
              value={renameValue}
              onChange={(e) => onRenameValueChange(e.target.value)}
              onBlur={() => onRenameCommit(tab.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onRenameCommit(tab.id);
                if (e.key === "Escape") onRenameCancel();
              }}
              className="w-20 px-1 py-0 text-xs bg-[var(--bg-primary)] border border-[var(--accent)] rounded outline-none"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                e.stopPropagation();
                onStartRename(tab.id, tab.name);
              }}
              className="truncate max-w-[100px]"
            >
              {tab.name}
            </span>
          )}
          {tabs.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(tab.id);
              }}
              className={`ml-1 rounded-full p-0.5 transition-colors ${
                tab.id === activeTabId
                  ? "hover:bg-[var(--bg-primary)]/20 text-[var(--bg-primary)]"
                  : "hover:bg-[var(--bg-primary)] text-[var(--text-muted)]"
              }`}
            >
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() => onAdd()}
        className="px-2 py-1 rounded-md text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-tertiary)] transition-colors flex-shrink-0"
        title={addLabel}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
