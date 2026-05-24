"use client";

import { useMemo } from "react";
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export interface ChartSpec {
  type: "bar" | "line" | "pie" | "scatter";
  title: string;
  xKey: string;
  yKey: string;
  data: Record<string, unknown>[];
}

const COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6",
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

// ── Bar ─────────────────────────────────────────────────────
function BarChartView({ spec }: { spec: ChartSpec }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={spec.data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
        <XAxis
          dataKey={spec.xKey}
          tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          tickFormatter={(v) => toStringVal(v).slice(0, 16)}
        />
        <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Bar dataKey={spec.yKey} fill={COLORS[0]} radius={[3, 3, 0, 0]} />
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
        <XAxis
          dataKey={spec.xKey}
          tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          tickFormatter={(v) => toStringVal(v).slice(0, 16)}
        />
        <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Line type="monotone" dataKey={spec.yKey} stroke={COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
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
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
          labelLine={false}
          style={{ fontSize: 11 }}
        >
          {pieData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: 6,
            fontSize: 12,
          }}
        />
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
        <XAxis
          dataKey="x"
          name={spec.xKey}
          tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
        />
        <YAxis
          dataKey="y"
          name={spec.yKey}
          tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Scatter data={scatterData} fill={COLORS[0]} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

// ── Main export ─────────────────────────────────────────────
export function AiChart({ spec }: { spec: ChartSpec }) {
  if (!spec.data || spec.data.length === 0) return null;

  const Chart =
    spec.type === "bar" ? BarChartView :
    spec.type === "line" ? LineChartView :
    spec.type === "pie" ? PieChartView :
    spec.type === "scatter" ? ScatterChartView :
    BarChartView; // fallback

  return (
    <div className="w-full">
      <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">
        {spec.title}
      </p>
      <Chart spec={spec} />
    </div>
  );
}
