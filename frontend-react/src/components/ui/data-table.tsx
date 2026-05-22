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
import { useState, useMemo } from "react";
import { cn } from "@/utils/cn";

interface DataTableProps {
  data: Record<string, unknown>[];
  columns: string[];
  maxRows?: number;
}

export function DataTable({ data, columns, maxRows = 500 }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const tableColumns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () =>
      columns.map((col) => ({
        id: col,
        accessorFn: (row) => row[col],
        header: col,
        cell: (info) => {
          const val = info.getValue();
          if (val === null || val === undefined) return <span className="text-[var(--text-muted)]">NULL</span>;
          return String(val);
        },
        enableSorting: true,
      })),
    [columns]
  );

  const displayData = useMemo(() => data.slice(0, maxRows), [data, maxRows]);

  const table = useReactTable({
    data: displayData,
    columns: tableColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (!data.length) {
    return <div className="text-[var(--text-muted)] text-sm p-4 text-center">No data available.</div>;
  }

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
      <div className="text-xs text-[var(--text-muted)] mb-2">
        {displayData.length} rows × {columns.length} columns
        {data.length > maxRows && ` (showing first ${maxRows})`}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-md border border-[var(--border-default)]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-[var(--bg-tertiary)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-3 py-2 text-left text-[var(--text-muted)] font-medium cursor-pointer hover:text-[var(--accent)] select-none whitespace-nowrap border-b border-[var(--border-default)]"
                  >
                    <span data-tooltip={header.column.id} className="inline-block max-w-[150px] truncate">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </span>
                    {header.column.getIsSorted() === "asc" && " ↑"}
                    {header.column.getIsSorted() === "desc" && " ↓"}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-[var(--border-default)] hover:bg-[var(--bg-secondary)] transition-colors",
                  i % 2 === 0 ? "bg-[var(--bg-primary)]" : "bg-transparent"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-1.5 whitespace-nowrap max-w-[200px] truncate">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
