"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

// ─── Types ───────────────────────────────────────────────────────────
interface SalesRow {
  order_date: string;
  ship_date: string;
  category: string;
  subcategory: string;
  sales_amount: number | null;
  quantity: number;
  discount: number | null;
  customer_region: string;
  is_returned: number;
}

interface FetchState {
  data: SalesRow[];
  totalRows: number;
  columns: string[];
  hasMore: boolean;
  loading: boolean;
  error: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────
const PAGE_SIZE = 200;
const OVERSCAN = 15;
const ROW_HEIGHT = 36;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

// ─── FPS Monitor ─────────────────────────────────────────────────────
function useFpsMonitor() {
  const [fps, setFps] = useState(60);
  const frames = useRef<number[]>([]);
  const rafId = useRef<number>(0);

  useEffect(() => {
    let running = true;
    const tick = () => {
      if (!running) return;
      const now = performance.now();
      frames.current.push(now);
      // keep last 60 frames
      while (frames.current.length > 0 && frames.current[0] < now - 1000) {
        frames.current.shift();
      }
      setFps(frames.current.length);
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return fps;
}

// ─── DOM Node Counter ────────────────────────────────────────────────
function useDomCount(ref: React.RefObject<HTMLElement | null>) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      if (ref.current) {
        setCount(ref.current.querySelectorAll("*").length);
      }
    }, 500);
    return () => clearInterval(id);
  }, [ref]);

  return count;
}

// ─── Column Helper ───────────────────────────────────────────────────
const columnHelper = createColumnHelper<SalesRow>();

function cellClass(value: unknown): string {
  if (value === null || value === undefined || value === "")
    return "text-zinc-600 italic";
  if (typeof value === "number" && value < 0) return "text-red-400 font-bold";
  if (typeof value === "number" && value === 999)
    return "text-orange-400 font-bold";
  return "";
}

const COLUMNS = [
  columnHelper.accessor("order_date", {
    header: "Order Date",
    size: 120,
    cell: (info) => <span className={cellClass(info.getValue())}>{info.getValue() ?? "NULL"}</span>,
  }),
  columnHelper.accessor("ship_date", {
    header: "Ship Date",
    size: 120,
    cell: (info) => <span className={cellClass(info.getValue())}>{info.getValue() ?? "NULL"}</span>,
  }),
  columnHelper.accessor("category", {
    header: "Category",
    size: 110,
  }),
  columnHelper.accessor("subcategory", {
    header: "Subcategory",
    size: 130,
  }),
  columnHelper.accessor("sales_amount", {
    header: "Sales Amt",
    size: 110,
    cell: (info) => {
      const v = info.getValue();
      return (
        <span className={cellClass(v)}>
          {v === null ? "NULL" : v === 0 ? "0.00" : v.toFixed(2)}
        </span>
      );
    },
  }),
  columnHelper.accessor("quantity", {
    header: "Qty",
    size: 70,
    cell: (info) => {
      const v = info.getValue();
      return <span className={cellClass(v)}>{v}</span>;
    },
  }),
  columnHelper.accessor("discount", {
    header: "Discount",
    size: 100,
    cell: (info) => {
      const v = info.getValue();
      return (
        <span className={cellClass(v)}>
          {v === null ? "NULL" : v.toFixed(4)}
        </span>
      );
    },
  }),
  columnHelper.accessor("customer_region", {
    header: "Region",
    size: 110,
  }),
  columnHelper.accessor("is_returned", {
    header: "Returned",
    size: 80,
    cell: (info) =>
      info.getValue() === 1 ? (
        <span className="text-red-400 font-bold">Yes</span>
      ) : (
        <span className="text-green-400">No</span>
      ),
  }),
];

// ─── Main Component ──────────────────────────────────────────────────
export default function VirtualDataTable({
  tableName = "large_sales_data",
}: {
  tableName?: string;
}) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableBodyRef = useRef<HTMLDivElement>(null);

  // ── State ──────────────────────────────────────────────────────────
  const [sorting, setSorting] = useState<SortingState>([]);
  const [fetchState, setFetchState] = useState<FetchState>({
    data: [],
    totalRows: 0,
    columns: [],
    hasMore: true,
    loading: false,
    error: null,
  });
  const [mode, setMode] = useState<"api" | "csv">("api");

  const fps = useFpsMonitor();
  const domCount = useDomCount(tableBodyRef);

  // ── Fetch page from API ────────────────────────────────────────────
  const fetchPage = useCallback(
    async (page: number) => {
      setFetchState((s) => ({ ...s, loading: true, error: null }));
      try {
        const url = `${API_BASE}/api/tables/${tableName}/data?page=${page}&page_size=${PAGE_SIZE}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setFetchState((s) => ({
          data: page === 0 ? json.data : [...s.data, ...json.data],
          totalRows: json.totalRows,
          columns: json.columns,
          hasMore: json.hasMore,
          loading: false,
          error: null,
        }));
      } catch (err: unknown) {
        setFetchState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : String(err),
        }));
      }
    },
    [tableName]
  );

  // ── Fetch CSV (standalone mode) ────────────────────────────────────
  const fetchCsv = useCallback(async () => {
    setFetchState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(
        `${API_BASE}/api/table/${tableName}/export`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",");
      const data: SalesRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(",");
        const row: Partial<SalesRow> = {};
        headers.forEach((h, j) => {
          const v = vals[j]?.trim() ?? "";
          const key = h as keyof SalesRow;
          if (v === "") {
            (row as Record<string, unknown>)[key] = null;
          } else if (
            h === "sales_amount" ||
            h === "discount"
          ) {
            (row as Record<string, unknown>)[key] = parseFloat(v);
          } else if (h === "quantity" || h === "is_returned") {
            (row as Record<string, unknown>)[key] = parseInt(v, 10);
          } else {
            (row as Record<string, unknown>)[key] = v;
          }
        });
        data.push(row as SalesRow);
      }
      setFetchState({
        data,
        totalRows: data.length,
        columns: headers,
        hasMore: false,
        loading: false,
        error: null,
      });
    } catch (err: unknown) {
      setFetchState((s) => ({ ...s, loading: false, error: err instanceof Error ? err.message : String(err) }));
    }
  }, [tableName]);

  // ── Initial load ───────────────────────────────────────────────────
  useEffect(() => {
    if (mode === "api") {
      fetchPage(0);
    } else {
      fetchCsv();
    }
  }, [mode, fetchPage, fetchCsv]);

  // ── Sort data server-side for API mode, client-side for CSV ────────
  const sortedData = useMemo(() => {
    if (sorting.length === 0 || mode === "api") return fetchState.data;
    const sorted = [...fetchState.data];
    const { id, desc } = sorting[0];
    sorted.sort((a, b) => {
      const av = a[id as keyof SalesRow];
      const bv = b[id as keyof SalesRow];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return desc ? bv - av : av - bv;
      }
      return desc
        ? String(bv).localeCompare(String(av))
        : String(av).localeCompare(String(bv));
    });
    return sorted;
  }, [fetchState.data, sorting, mode]);

  // ── Table instance ─────────────────────────────────────────────────
  const table = useReactTable({
    data: sortedData,
    columns: COLUMNS,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugAll: false,
  });

  const { rows } = table.getRowModel();

  // ── Virtualizer ────────────────────────────────────────────────────
  const rowVirtualizer = useVirtualizer({
    count: fetchState.hasMore ? rows.length + 1 : rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  // ── Infinite scroll: fetch more when near bottom ───────────────────
  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    if (!virtualItems.length || !fetchState.hasMore || fetchState.loading)
      return;

    const lastItem = virtualItems[virtualItems.length - 1];
    if (lastItem.index >= rows.length - 20) {
      const nextPage = Math.ceil(rows.length / PAGE_SIZE);
      fetchPage(nextPage);
    }
  }, [
    fetchState.hasMore,
    fetchState.loading,
    rows.length,
    fetchPage,
    rowVirtualizer,
  ]);

  // ── Render ─────────────────────────────────────────────────────────
  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  return (
    <div className="flex flex-col h-full">
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 py-2 bg-zinc-900 border-b border-zinc-700 text-xs shrink-0">
        <span className="text-zinc-400">Table:</span>
        <span className="text-zinc-200 font-mono">{tableName}</span>
        <span className="text-zinc-500">|</span>
        <span className="text-zinc-400">Loaded:</span>
        <span className="text-emerald-400 font-mono">
          {fmtNum(rows.length)}
        </span>
        <span className="text-zinc-500">/</span>
        <span className="text-zinc-400">Total:</span>
        <span className="text-zinc-200 font-mono">
          {fmtNum(fetchState.totalRows)}
        </span>
        <span className="text-zinc-500">|</span>
        <span className="text-zinc-400">DOM:</span>
        <span
          className={`font-mono ${
            domCount < 500 ? "text-emerald-400" : "text-yellow-400"
          }`}
        >
          {domCount}
        </span>
        <span className="text-zinc-500">|</span>
        <span className="text-zinc-400">FPS:</span>
        <span
          className={`font-mono ${
            fps >= 50
              ? "text-emerald-400"
              : fps >= 30
              ? "text-yellow-400"
              : "text-red-400"
          }`}
        >
          {fps}
        </span>
        <span className="text-zinc-500">|</span>
        <span className="text-zinc-400">Virtual:</span>
        <span className="text-emerald-400 font-mono">
          {virtualItems.length} rows rendered
        </span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setMode("api")}
            className={`px-2 py-0.5 rounded ${
              mode === "api"
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            API Mode
          </button>
          <button
            onClick={() => setMode("csv")}
            className={`px-2 py-0.5 rounded ${
              mode === "csv"
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            CSV Mode
          </button>
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────────────────── */}
      {fetchState.error && (
        <div className="px-4 py-2 bg-red-900/40 text-red-300 text-xs border-b border-red-800">
          Error: {fetchState.error}
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div
        ref={tableContainerRef}
        className="flex-1 overflow-auto relative"
        style={{ contain: "strict" }}
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-600">
          {table.getHeaderGroups().map((headerGroup) => (
            <div key={headerGroup.id} className="flex">
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  className="px-3 py-2 text-xs font-bold text-zinc-300 uppercase tracking-wider select-none cursor-pointer hover:bg-zinc-800 shrink-0 whitespace-nowrap border-r border-zinc-700"
                  style={{ width: header.getSize() }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {{
                    asc: " ↑",
                    desc: " ↓",
                  }[header.column.getIsSorted() as string] ?? ""}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Virtual body */}
        <div
          ref={tableBodyRef}
          style={{ height: `${totalSize}px`, position: "relative" }}
        >
          {virtualItems.map((virtualRow) => {
            const isLoaderRow = virtualRow.index > rows.length - 1;
            const row = rows[virtualRow.index];

            if (isLoaderRow) {
              return (
                <div
                  key="loader"
                  className="flex items-center justify-center text-zinc-400 text-xs"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {fetchState.loading ? "Loading more..." : "All data loaded"}
                </div>
              );
            }

            return (
              <div
                key={row.id}
                className={`flex border-b border-zinc-800/50 hover:bg-zinc-800/40 ${
                  virtualRow.index % 2 === 0 ? "bg-zinc-900/30" : ""
                }`}
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
                    className="px-3 py-1 text-xs text-zinc-300 shrink-0 whitespace-nowrap overflow-hidden text-ellipsis border-r border-zinc-800/30"
                    style={{ width: cell.column.getSize() }}
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
      </div>

      {/* ── Status bar ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 py-1.5 bg-zinc-900 border-t border-zinc-700 text-[10px] text-zinc-500 shrink-0">
        <span>
          Rows: {fmtNum(rows.length)} / {fmtNum(fetchState.totalRows)}
        </span>
        <span>Rendered DOM nodes: {domCount}</span>
        <span>
          Virtual items: {virtualItems.length} / {fmtNum(rows.length)}
        </span>
        <span>Overscan: {OVERSCAN}</span>
        <span>Page size: {PAGE_SIZE}</span>
        <span className="ml-auto">
          Expected DOM: ~{OVERSCAN * 2 + Math.ceil(800 / ROW_HEIGHT)} rows ×
          9 cols ≈ {((OVERSCAN * 2 + Math.ceil(800 / ROW_HEIGHT)) * 9)} nodes
        </span>
      </div>
    </div>
  );
}
