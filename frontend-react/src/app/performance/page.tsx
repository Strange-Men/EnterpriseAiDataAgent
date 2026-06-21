"use client";
// EXPERIMENTAL: This page is not linked from main navigation.
// It is kept for development/debugging purposes only.

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";

// ── Metric card ───────────────────────────────────────────────
function MetricCard({
  label, value, unit, threshold, status,
}: {
  label: string;
  value: string | number;
  unit: string;
  threshold: number;
  status: "pass" | "warn" | "fail" | "idle";
}) {
  const { t } = useTranslation();
  const statusColor = {
    pass: "text-green-400 border-green-500/30 bg-green-500/5",
    warn: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5",
    fail: "text-red-400 border-red-500/30 bg-red-500/5",
    idle: "text-[var(--text-muted)] border-[var(--border-default)] bg-[var(--bg-primary)]",
  }[status];

  const statusLabel = {
    pass: t("perf.pass"),
    warn: t("perf.warn"),
    fail: t("perf.fail"),
    idle: "—",
  }[status];

  return (
    <div className={`rounded-lg border p-4 ${statusColor}`}>
      <div className="text-xs text-[var(--text-muted)] mb-1">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        <span className="text-xs text-[var(--text-muted)]">{unit}</span>
      </div>
      <div className="flex items-center justify-between mt-2 text-[10px] text-[var(--text-muted)]">
        <span>{t("perf.threshold")}: {threshold.toLocaleString()} {unit}</span>
        <span className={`font-medium ${
          status === "pass" ? "text-green-400" :
          status === "warn" ? "text-yellow-400" :
          status === "fail" ? "text-red-400" : ""
        }`}>{statusLabel}</span>
      </div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────
interface PerfMetrics {
  pageLoadMs: number;
  domNodes: number;
  heapUsedMB: number;
  heapLimitMB: number;
  ttfbMs: number;
  fcpMs: number;
  resourceCount: number;
  totalResourceKB: number;
}

interface BenchmarkResult {
  name: string;
  metrics: PerfMetrics;
  timestamp: string;
}

function PerformanceContent() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<PerfMetrics | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<BenchmarkResult[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  // ── Collect current metrics ───────────────────────────────
  const collectMetrics = useCallback((): PerfMetrics => {
    const perf = window.performance;
    const nav = perf.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const mem = (performance as unknown as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;

    // DOM nodes
    const domNodes = document.querySelectorAll("*").length;

    // Page load
    const pageLoadMs = nav ? Math.round(nav.loadEventEnd - nav.startTime) : 0;
    const ttfbMs = nav ? Math.round(nav.responseStart - nav.startTime) : 0;

    // FCP from PerformanceObserver data (approximate from nav timing)
    const paintEntries = perf.getEntriesByType("paint");
    const fcpEntry = paintEntries.find((e) => e.name === "first-contentful-paint");
    const fcpMs = fcpEntry ? Math.round(fcpEntry.startTime) : 0;

    // Heap
    const heapUsedMB = mem ? Math.round(mem.usedJSHeapSize / 1048576) : 0;
    const heapLimitMB = mem ? Math.round(mem.jsHeapSizeLimit / 1048576) : 0;

    // Resources
    const resources = perf.getEntriesByType("resource");
    const totalResourceKB = Math.round(
      resources.reduce((sum, r) => sum + (r as PerformanceResourceTiming).transferSize, 0) / 1024
    );

    return {
      pageLoadMs,
      domNodes,
      heapUsedMB,
      heapLimitMB,
      ttfbMs,
      fcpMs,
      resourceCount: resources.length,
      totalResourceKB,
    };
  }, []);

  // Initial load
  useEffect(() => {
    const m = collectMetrics();
    setMetrics(m);
  }, [collectMetrics]);

  // ── Run benchmark ─────────────────────────────────────────
  const runBenchmark = useCallback(async () => {
    setIsRunning(true);
    // Small delay to let any pending renders complete
    await new Promise((r) => setTimeout(r, 500));
    if (!mountedRef.current) return;
    const m = collectMetrics();
    setMetrics(m);
    const result: BenchmarkResult = {
      name: `Run ${history.length + 1}`,
      metrics: m,
      timestamp: new Date().toISOString(),
    };
    setHistory((prev) => [result, ...prev].slice(0, 10));
    setIsRunning(false);
  }, [collectMetrics, history.length]);

  // ── Status helpers ────────────────────────────────────────
  const getStatus = (value: number, threshold: number): "pass" | "warn" | "fail" | "idle" => {
    if (value === 0) return "idle";
    if (value <= threshold * 0.8) return "pass";
    if (value <= threshold) return "warn";
    return "fail";
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            ← Back
          </Link>
          <h1 className="text-sm font-semibold text-[var(--accent)] uppercase tracking-wider">
            {t("perf.title")}
          </h1>
        </div>
        <button
          onClick={runBenchmark}
          disabled={isRunning}
          className="px-4 py-1.5 text-xs bg-[var(--accent)] text-[var(--bg-primary)] rounded-md hover:opacity-90 transition-opacity font-medium disabled:opacity-50 flex items-center gap-1.5"
        >
          {isRunning ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-[var(--bg-primary)] border-t-transparent rounded-full animate-spin" />
              {t("perf.running")}
            </>
          ) : (
            t("perf.run-benchmarks")
          )}
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Metrics grid */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label={t("perf.page-load")}
              value={metrics.pageLoadMs}
              unit="ms"
              threshold={5000}
              status={getStatus(metrics.pageLoadMs, 5000)}
            />
            <MetricCard
              label={t("perf.dom-nodes")}
              value={metrics.domNodes}
              unit="nodes"
              threshold={3000}
              status={getStatus(metrics.domNodes, 3000)}
            />
            <MetricCard
              label={t("perf.heap-memory")}
              value={metrics.heapUsedMB}
              unit="MB"
              threshold={100}
              status={getStatus(metrics.heapUsedMB, 100)}
            />
            <MetricCard
              label="TTFB"
              value={metrics.ttfbMs}
              unit="ms"
              threshold={2000}
              status={getStatus(metrics.ttfbMs, 2000)}
            />
            <MetricCard
              label="FCP"
              value={metrics.fcpMs}
              unit="ms"
              threshold={3000}
              status={getStatus(metrics.fcpMs, 3000)}
            />
            <MetricCard
              label="Resources"
              value={metrics.resourceCount}
              unit="files"
              threshold={100}
              status={getStatus(metrics.resourceCount, 100)}
            />
            <MetricCard
              label="Transfer Size"
              value={metrics.totalResourceKB}
              unit="KB"
              threshold={5000}
              status={getStatus(metrics.totalResourceKB, 5000)}
            />
            <MetricCard
              label="Heap Limit"
              value={metrics.heapLimitMB}
              unit="MB"
              threshold={4096}
              status="idle"
            />
          </div>
        )}

        {/* Summary */}
        {metrics && (
          <div className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-secondary)]">
            <h2 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-3">
              Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[var(--text-muted)]">Page Load: </span>
                <span className={getStatus(metrics.pageLoadMs, 5000) === "pass" ? "text-green-400" : "text-yellow-400"}>
                  {metrics.pageLoadMs}ms
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">DOM: </span>
                <span className={getStatus(metrics.domNodes, 3000) === "pass" ? "text-green-400" : "text-yellow-400"}>
                  {metrics.domNodes} nodes
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Heap: </span>
                <span className={getStatus(metrics.heapUsedMB, 100) === "pass" ? "text-green-400" : "text-yellow-400"}>
                  {metrics.heapUsedMB}MB
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Transfer: </span>
                <span className={getStatus(metrics.totalResourceKB, 5000) === "pass" ? "text-green-400" : "text-yellow-400"}>
                  {metrics.totalResourceKB}KB
                </span>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-secondary)]">
            <h2 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-3">
              {t("perf.last-run")} ({history.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-default)]">
                    <th className="text-left py-2 px-3 text-[var(--text-muted)] font-medium">#</th>
                    <th className="text-left py-2 px-3 text-[var(--text-muted)] font-medium">{t("perf.page-load")}</th>
                    <th className="text-left py-2 px-3 text-[var(--text-muted)] font-medium">{t("perf.dom-nodes")}</th>
                    <th className="text-left py-2 px-3 text-[var(--text-muted)] font-medium">{t("perf.heap-memory")}</th>
                    <th className="text-left py-2 px-3 text-[var(--text-muted)] font-medium">TTFB</th>
                    <th className="text-left py-2 px-3 text-[var(--text-muted)] font-medium">Transfer</th>
                    <th className="text-left py-2 px-3 text-[var(--text-muted)] font-medium">{t("perf.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((run, i) => {
                    const allPass =
                      getStatus(run.metrics.pageLoadMs, 5000) === "pass" &&
                      getStatus(run.metrics.domNodes, 3000) === "pass" &&
                      getStatus(run.metrics.heapUsedMB, 100) === "pass";
                    return (
                      <tr key={i} className="border-b border-[var(--border-default)]/50">
                        <td className="py-2 px-3 text-[var(--text-muted)]">{run.name}</td>
                        <td className="py-2 px-3 tabular-nums">{run.metrics.pageLoadMs}ms</td>
                        <td className="py-2 px-3 tabular-nums">{run.metrics.domNodes}</td>
                        <td className="py-2 px-3 tabular-nums">{run.metrics.heapUsedMB}MB</td>
                        <td className="py-2 px-3 tabular-nums">{run.metrics.ttfbMs}ms</td>
                        <td className="py-2 px-3 tabular-nums">{run.metrics.totalResourceKB}KB</td>
                        <td className="py-2 px-3">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            allPass ? "text-green-400 bg-green-500/10" : "text-yellow-400 bg-yellow-500/10"
                          }`}>
                            {allPass ? t("perf.pass") : "Check"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PerformancePage() {
  return <PerformanceContent />;
}
