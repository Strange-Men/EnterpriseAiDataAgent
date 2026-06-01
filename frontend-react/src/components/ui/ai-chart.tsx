"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Download, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartSkeleton } from "@/components/ui/skeleton";
import type { ChartSpec } from "@/types";

// Re-export for consumers
export type { ChartSpec } from "@/types";

const THEME_COLORS = [
  "var(--accent)", "var(--success)", "var(--info)",
  "var(--warning)", "var(--error)", "#8b5cf6",
  "#06b6d4", "#ec4899",
];

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

function toStringVal(v: unknown): string {
  if (v == null) return "";
  return String(v);
}

const tooltipStyle = {
  background: "var(--bg-secondary)",
  border: "1px solid var(--border-default)",
  borderRadius: 6,
  fontSize: 12,
  color: "var(--text-primary)",
};

// ── Bar ─────────────────────────────────────────────────────
function BarChartView({ spec }: { spec: ChartSpec }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={spec.data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
        <XAxis dataKey={spec.xKey} tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          tickFormatter={(v) => toStringVal(v).slice(0, 16)} />
        <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey={spec.yKey} fill={THEME_COLORS[0]} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Line ────────────────────────────────────────────────────
function LineChartView({ spec }: { spec: ChartSpec }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={spec.data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
        <XAxis dataKey={spec.xKey} tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          tickFormatter={(v) => toStringVal(v).slice(0, 16)} />
        <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey={spec.yKey} stroke={THEME_COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Pie ─────────────────────────────────────────────────────
function PieChartView({ spec }: { spec: ChartSpec }) {
  const pieData = useMemo(
    () => spec.data.map((d) => ({ name: toStringVal(d[spec.xKey]), value: toNumber(d[spec.yKey]) })),
    [spec.data, spec.xKey, spec.yKey]
  );

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={pieData} cx="50%" cy="50%" outerRadius={100}
          dataKey="value"
          label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
          labelLine={false}
          style={{ fontSize: 11 }}>
          {pieData.map((_, i) => (
            <Cell key={i} fill={THEME_COLORS[i % THEME_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Scatter ─────────────────────────────────────────────────
function ScatterChartView({ spec }: { spec: ChartSpec }) {
  const scatterData = useMemo(
    () => spec.data.map((d) => ({ x: toNumber(d[spec.xKey]), y: toNumber(d[spec.yKey]) })),
    [spec.data, spec.xKey, spec.yKey]
  );
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
        <XAxis dataKey="x" name={spec.xKey} tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
        <YAxis dataKey="y" name={spec.yKey} tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Scatter data={scatterData} fill={THEME_COLORS[0]} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

// ── Main export ─────────────────────────────────────────────
export function AiChart({ spec, loading }: { spec: ChartSpec; loading?: boolean }) {
  const [fullscreen, setFullscreen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // ESC to exit fullscreen
  useEffect(() => {
    if (!fullscreen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [fullscreen]);

  const handleDownload = useCallback(() => {
    const svg = chartRef.current?.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([`<?xml version="1.0" standalone="no"?>\r\n${source}`], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${spec.title.replace(/\s+/g, "-").toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [spec.title]);

  // Empty state
  if (!loading && (!spec.data || spec.data.length === 0)) {
    return (
      <div className="w-full border border-[var(--border-default)] rounded-lg p-6 bg-[var(--bg-secondary)]">
        <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">{spec.title}</p>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-xs text-[var(--text-muted)]">No data to chart</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="w-full">
        <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">{spec.title}</p>
        <ChartSkeleton />
      </div>
    );
  }

  const Chart = spec.type === "bar" ? BarChartView :
    spec.type === "line" ? LineChartView :
    spec.type === "pie" ? PieChartView :
    spec.type === "scatter" ? ScatterChartView :
    BarChartView;

  const content = (
    <div className={fullscreen ? "fixed inset-0 z-modal bg-[var(--bg-primary)] p-8 flex flex-col" : "w-full"}>
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
          {spec.title}
        </p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleDownload} title="Download SVG">
            <Download className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setFullscreen(!fullscreen)}>
            {fullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      <div ref={chartRef} className={fullscreen ? "flex-1 min-h-0" : ""}>
        <Chart spec={spec} />
      </div>
    </div>
  );

  if (!fullscreen) {
    return (
      <div className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-secondary)]">
        {content}
      </div>
    );
  }

  return content;
}
