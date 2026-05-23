import { test, expect } from "@playwright/test";

/**
 * Performance Regression Tests — Enterprise AI Data Agent
 *
 * Automated benchmarks:
 * - Page load time
 * - DOM node count
 * - JS heap memory
 * - Query execution latency
 * - DOM stability
 * - Memory stability
 *
 * Run: npx playwright test e2e/performance.spec.ts
 * Output: test-results/performance-report.json
 */

// ── Thresholds ──────────────────────────────────────────────────

const THRESHOLDS = {
  pageLoadMs: 5000,
  domNodes: 3000,
  heapUsedMb: 100,
  queryLatencyMs: 5000,
  domGrowthNodes: 500,
  heapGrowthMb: 50,
};

// ── Report ──────────────────────────────────────────────────────

interface PerfMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  pass: boolean;
}

const reportMetrics: PerfMetric[] = [];

function record(name: string, value: number, unit: string, threshold: number) {
  reportMetrics.push({
    name,
    value: Math.round(value * 100) / 100,
    unit,
    threshold,
    pass: value <= threshold,
  });
}

// ── Tests ───────────────────────────────────────────────────────

test.describe("Performance", () => {
  test("page load within threshold", async ({ page }) => {
    const start = Date.now();
    await page.goto("/");
    await page.waitForSelector(".monaco-editor", { timeout: 30000 });
    const elapsed = Date.now() - start;

    record("page-load", elapsed, "ms", THRESHOLDS.pageLoadMs);
    expect(elapsed).toBeLessThan(THRESHOLDS.pageLoadMs);

    // DOM node count
    const domSize = await page.evaluate(() => document.querySelectorAll("*").length);
    record("dom-nodes", domSize, "count", THRESHOLDS.domNodes);
    expect(domSize).toBeLessThan(THRESHOLDS.domNodes);
  });

  test("heap memory within limits", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".monaco-editor", { timeout: 15000 });

    const heapUsed = await page.evaluate(() => {
      if ("memory" in performance) {
        return (performance as any).memory.usedJSHeapSize / (1024 * 1024);
      }
      return -1;
    });

    if (heapUsed >= 0) {
      record("heap-used", heapUsed, "MB", THRESHOLDS.heapUsedMb);
      expect(heapUsed).toBeLessThan(THRESHOLDS.heapUsedMb);
    }
  });

  test("query execution within threshold", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".monaco-editor", { timeout: 15000 });

    await page.locator(".monaco-editor").click();
    await page.keyboard.type("SELECT * FROM generate_series(1, 100)", { delay: 20 });
    await page.waitForTimeout(500);

    const start = Date.now();
    const executeBtn = page.locator('button:has-text("Execute")');
    await executeBtn.click();

    // Wait for result
    await page.waitForSelector("text=rows", { timeout: 10000 }).catch(() => {});
    const elapsed = Date.now() - start;

    record("query-latency", elapsed, "ms", THRESHOLDS.queryLatencyMs);
    expect(elapsed).toBeLessThan(THRESHOLDS.queryLatencyMs);
  });

  test("DOM stability after tab operations", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".monaco-editor", { timeout: 15000 });

    const initialDomSize = await page.evaluate(() => document.querySelectorAll("*").length);

    for (let i = 0; i < 5; i++) {
      const newTabBtn = page.locator('button[title="New Tab"]');
      await newTabBtn.click();
      await page.waitForTimeout(300);
    }

    const afterDomSize = await page.evaluate(() => document.querySelectorAll("*").length);
    const growth = afterDomSize - initialDomSize;

    record("dom-growth-tabs", growth, "nodes", THRESHOLDS.domGrowthNodes);
    expect(growth).toBeLessThan(THRESHOLDS.domGrowthNodes);
  });

  test("memory stability across reloads", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".monaco-editor", { timeout: 15000 });

    const initialHeap = await page.evaluate(() => {
      if ("memory" in performance) {
        return (performance as any).memory.usedJSHeapSize / (1024 * 1024);
      }
      return -1;
    });

    for (let i = 0; i < 3; i++) {
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForSelector(".monaco-editor", { timeout: 15000 });
    }

    const finalHeap = await page.evaluate(() => {
      if ("memory" in performance) {
        return (performance as any).memory.usedJSHeapSize / (1024 * 1024);
      }
      return -1;
    });

    if (initialHeap >= 0 && finalHeap >= 0) {
      const growth = finalHeap - initialHeap;
      record("heap-growth-reloads", growth, "MB", THRESHOLDS.heapGrowthMb);
      expect(growth).toBeLessThan(THRESHOLDS.heapGrowthMb);
    }
  });

  // Write report after all tests
  test.afterAll(async () => {
    const fs = require("fs");
    const path = require("path");

    const report = {
      timestamp: new Date().toISOString(),
      metrics: reportMetrics,
      summary: {
        total: reportMetrics.length,
        passed: reportMetrics.filter((m) => m.pass).length,
        failed: reportMetrics.filter((m) => !m.pass).length,
      },
    };

    const reportDir = path.join(__dirname, "..", "test-results");
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(reportDir, "performance-report.json"),
      JSON.stringify(report, null, 2)
    );

    console.log("\n--- Performance Report ---");
    console.log(`Passed: ${report.summary.passed}/${report.summary.total}`);
    for (const m of reportMetrics) {
      const status = m.pass ? "PASS" : "FAIL";
      console.log(`  [${status}] ${m.name}: ${m.value}${m.unit} (limit: ${m.threshold}${m.unit})`);
    }
  });
});
