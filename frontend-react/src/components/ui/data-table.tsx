"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { cn } from "@/utils/cn";

interface DataTableProps {
  data: Record<string, unknown>[];
  columns: string[];
  /** Enable virtual scrolling for large datasets (default: true) */
  virtualized?: boolean;
  /** Fixed row height in px for virtualizer (default: 36) */
  rowHeight?: number;
  /** Number of rows to overscan above/below viewport (default: 10) */
  overscan?: number;
  /** Callback when user scrolls near the bottom (for infinite loading) */
  onLoadMore?: () => void;
  /** Whether more data is available to load */
  hasMore?: boolean;
  /** Whether data is currently loading */
  isLoading?: boolean;
}

const ROW_HEIGHT_DEFAULT = 36;
const OVERSCAN_DEFAULT = 10;

export function DataTable({
  data,
  columns,
  virtualized = true,
  rowHeight = ROW_HEIGHT_DEFAULT,
  overscan = OVERSCAN_DEFAULT,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const tableColumns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () =>
      columns.map((col) => ({
        id: col,
        accessorFn: (row) => row[col],
        header: col,
        cell: (info) => {
          const val = info.getValue();
          if (val === null || val === undefined)
            return <span className="text-[var(--text-muted)] italic">NULL</span>;
          if (typeof val === "number" && val < 0)
            return <span className="text-red-400">{String(val)}</span>;
          return String(val);
        },
        enableSorting: true,
      })),
    [columns]
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const { rows } = table.getRowModel();

  // ── Virtualizer ────────────────────────────────────────────────────
  const rowVirtualizer = useVirtualizer({
    count: hasMore ? rows.length + 1 : rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => rowHeight,
    overscan,
    enabled: virtualized,
  });

  // ── Infinite scroll trigger ────────────────────────────────────────
  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoading) return;
    const items = rowVirtualizer.getVirtualItems();
    if (!items.length) return;
    const last = items[items.length - 1];
    if (last.index >= rows.length - 10) {
      onLoadMore();
    }
  }, [
    rowVirtualizer.getVirtualItems(),
    onLoadMore,
    hasMore,
    isLoading,
    rows.length,
    rowVirtualizer,
  ]);

  if (!data.length) {
    return (
      <div className="text-[var(--text-muted)] text-sm p-4 text-center">
        No data available.
      </div>
    );
  }

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  return (
    <div className="flex flex-col h-full">
      {/* Filter */}
      <div className="mb-3">
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Filter..."
          className="w-full px-3 py-1.5 text-sm bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-md focus:border-[var(--accent)] focus:outline-none"
        />
      </div>

      {/* Stats */}
      <div className="text-xs text-[var(--text-muted)] mb-2 flex items-center gap-3">
        <span>
          {rows.length} rows × {columns.length} columns
        </span>
        {virtualized && (
          <>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-500">
              Virtual: {virtualItems.length} DOM rows
            </span>
          </>
        )}
        {hasMore && (
          <>
            <span className="text-zinc-600">|</span>
            <span>{isLoading ? "Loading..." : "Scroll for more"}</span>
          </>
        )}
      </div>

      {/* Table */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto rounded-md border border-[var(--border-default)]"
        style={{ contain: "strict" }}
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-[var(--bg-tertiary)]">
          {table.getHeaderGroups().map((headerGroup) => (
            <div key={headerGroup.id} className="flex">
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="px-3 py-2 text-left text-[var(--text-muted)] font-medium cursor-pointer hover:text-[var(--accent)] select-none whitespace-nowrap border-b border-[var(--border-default)] shrink-0"
                  style={{
                    width: virtualized
                      ? Math.max(120, header.getSize())
                      : undefined,
                    minWidth: virtualized ? 120 : undefined,
                  }}
                >
                  <span className="inline-block max-w-[150px] truncate">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </span>
                  {header.column.getIsSorted() === "asc" && " ↑"}
                  {header.column.getIsSorted() === "desc" && " ↓"}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Body: virtualized or standard */}
        {virtualized ? (
          <div
            style={{ height: `${totalSize}px`, position: "relative" }}
          >
            {virtualItems.map((virtualRow) => {
              const isLoaderRow = virtualRow.index > rows.length - 1;
              if (isLoaderRow) {
                return (
                  <div
                    key="loader"
                    className="flex items-center justify-center text-[var(--text-muted)] text-xs"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {isLoading ? "Loading more rows..." : "All data loaded"}
                  </div>
                );
              }

              const row = rows[virtualRow.index];
              return (
                <div
                  key={row.id}
                  className={cn(
                    "flex border-b border-[var(--border-default)] hover:bg-[var(--bg-secondary)] transition-colors",
                    virtualRow.index % 2 === 0
                      ? "bg-[var(--bg-primary)]"
                      : "bg-transparent"
                  )}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <div
                      key={cell.id}
                      className="px-3 py-1.5 whitespace-nowrap truncate shrink-0 text-sm"
                      style={{
                        width: Math.max(120, cell.column.getSize()),
                        maxWidth: 250,
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          // Non-virtualized fallback for small datasets
          <table className="w-full text-sm">
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-[var(--border-default)] hover:bg-[var(--bg-secondary)] transition-colors",
                    i % 2 === 0 ? "bg-[var(--bg-primary)]" : "bg-transparent"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-3 py-1.5 whitespace-nowrap max-w-[200px] truncate"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
