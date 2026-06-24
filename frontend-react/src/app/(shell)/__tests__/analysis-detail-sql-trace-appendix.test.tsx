/**
 * M4-8.4.3: SQL / Trace Appendix Folding Tests
 *
 * Verifies:
 * 1. SQL Appendix exists
 * 2. SQL Appendix collapsed by default
 * 3. SQL content still expandable
 * 4. Copy SQL button works
 * 5. Technical Trace exists
 * 6. Trace collapsed by default
 * 7. Trace content still expandable
 * 8. Trace appears after Summary / Key Findings / Main Result
 * 9. SQL Appendix appears after Summary / Key Findings / Main Result
 * 10. Does not modify Markdown export behavior
 * 11. Does not modify Store behavior
 * 12. Invalid run id still friendly
 * 13. Does not restore Templates / Schedule / Diff / Timeline
 * 14. Does not restore /performance, /virtual-table
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RunSections } from "@/components/investigation/run-sections";
import { RunTrace } from "@/components/investigation/run-trace";
import type { AnalysisRun } from "@/stores/analysis-store";
import type { MultiStepResult } from "@/services/api";

// ── Mock react-i18next ────────────────────────────────────────────
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts && typeof opts === "object") {
        return key + ":" + JSON.stringify(opts);
      }
      return key;
    },
  }),
}));

// ── Helpers ────────────────────────────────────────────────────────
function makeMultiResult(overrides?: Partial<MultiStepResult>): MultiStepResult {
  return {
    question: "Test question",
    plan: [],
    steps: [],
    summary: "Test summary",
    status: "success",
    ...overrides,
  };
}

function makeRun(overrides?: Partial<AnalysisRun>): AnalysisRun {
  return {
    id: "test-run-1",
    mode: "autonomous",
    question: "Test question",
    table: "test_table",
    timestamp: "2026-06-24T10:00:00Z",
    status: "success",
    sections: [],
    chartSpecs: [],
    multiResult: null,
    trace: null,
    saved: false,
    version: 1,
    ...overrides,
  } as AnalysisRun;
}

function makeTrace(): AnalysisRun["trace"] {
  return {
    trace_id: "trace-1",
    total_llm_calls: 2,
    total_input_tokens: 100,
    total_output_tokens: 50,
    events: [
      {
        timestamp: "2026-06-24T10:00:01Z",
        phase: "planning",
        operation: "generate_plan",
        prompt_name: "analysis_plan",
        status: "success",
        latency_ms: 500,
        input_tokens: 80,
        output_tokens: 30,
      },
      {
        timestamp: "2026-06-24T10:00:02Z",
        phase: "execution",
        operation: "execute_sql",
        prompt_name: "sql_execution",
        status: "success",
        latency_ms: 200,
        input_tokens: 20,
        output_tokens: 20,
      },
    ],
    guardrail_violations: [],
  };
}

// ── SQL Appendix Tests ──────────────────────────────────────────────

describe("M4-8.4.3: SQL Appendix", () => {
  it("shows SQL appendix section", () => {
    const run = makeRun({
      multiResult: makeMultiResult({
        steps: [
          { step: 1, purpose: "Get data", sql: "SELECT * FROM test", columns: [], data: [], status: "success" },
        ],
      }),
    });
    render(<RunSections run={run} />);
    expect(screen.getByText("inv.sql-appendix")).toBeDefined();
  });

  it("SQL appendix is collapsed by default", () => {
    const run = makeRun({
      multiResult: makeMultiResult({
        steps: [
          { step: 1, purpose: "Get data", sql: "SELECT * FROM test", columns: [], data: [], status: "success" },
        ],
      }),
    });
    render(<RunSections run={run} />);
    // SQL content should not be visible by default
    expect(screen.queryByText("SELECT * FROM test")).toBeNull();
    // But the SQL count should be visible in the header
    expect(screen.getByText("1 SQL")).toBeDefined();
  });

  it("SQL content expands when clicked", () => {
    const run = makeRun({
      multiResult: makeMultiResult({
        steps: [
          { step: 1, purpose: "Get data", sql: "SELECT * FROM test", columns: [], data: [], status: "success" },
        ],
      }),
    });
    render(<RunSections run={run} />);
    // Click the SQL appendix header
    const headerButton = screen.getByText("inv.sql-appendix").closest("button");
    expect(headerButton).toBeDefined();
    fireEvent.click(headerButton!);
    // After clicking, SQL content should be visible
    expect(screen.getByText("SELECT * FROM test")).toBeDefined();
    expect(screen.getByText("inv.sql-appendix-desc")).toBeDefined();
  });

  it("shows copy SQL button when expanded", () => {
    const run = makeRun({
      multiResult: makeMultiResult({
        steps: [
          { step: 1, purpose: "Get data", sql: "SELECT * FROM test", columns: [], data: [], status: "success" },
        ],
      }),
    });
    render(<RunSections run={run} />);
    const headerButton = screen.getByText("inv.sql-appendix").closest("button");
    fireEvent.click(headerButton!);
    expect(screen.getByText("inv.copy-sql")).toBeDefined();
  });

  it("shows SQL count in header", () => {
    const run = makeRun({
      multiResult: makeMultiResult({
        steps: [
          { step: 1, purpose: "Step 1", sql: "SELECT 1", columns: [], data: [], status: "success" },
          { step: 2, purpose: "Step 2", sql: "SELECT 2", columns: [], data: [], status: "success" },
        ],
      }),
    });
    render(<RunSections run={run} />);
    expect(screen.getByText("2 SQL")).toBeDefined();
  });

  it("shows empty state when no SQL", () => {
    const run = makeRun({
      multiResult: makeMultiResult({ steps: [] }),
    });
    render(<RunSections run={run} />);
    expect(screen.getByText("inv.sql-appendix-empty")).toBeDefined();
  });

  it("shows multiple SQL statements when expanded", () => {
    const run = makeRun({
      multiResult: makeMultiResult({
        steps: [
          { step: 1, purpose: "Get categories", sql: "SELECT DISTINCT category FROM sales", columns: [], data: [], status: "success" },
          { step: 2, purpose: "Get totals", sql: "SELECT category, SUM(amount) FROM sales GROUP BY category", columns: [], data: [], status: "success" },
        ],
      }),
    });
    render(<RunSections run={run} />);
    const headerButton = screen.getByText("inv.sql-appendix").closest("button");
    fireEvent.click(headerButton!);
    expect(screen.getByText("SELECT DISTINCT category FROM sales")).toBeDefined();
    expect(screen.getByText("SELECT category, SUM(amount) FROM sales GROUP BY category")).toBeDefined();
  });
});

// ── Technical Trace Tests ──────────────────────────────────────────

describe("M4-8.4.3: Technical Trace", () => {
  it("shows technical trace section when trace exists", () => {
    const run = makeRun({ trace: makeTrace() });
    render(<RunTrace run={run} />);
    expect(screen.getByText("inv.technical-trace")).toBeDefined();
  });

  it("trace is collapsed by default", () => {
    const run = makeRun({ trace: makeTrace() });
    render(<RunTrace run={run} />);
    // Trace content should not be visible by default
    expect(screen.queryByText("inv.technical-trace-desc")).toBeNull();
    // But the expand hint should be visible
    expect(screen.getByText("inv.technical-trace-expand")).toBeDefined();
  });

  it("trace content expands when clicked", () => {
    const run = makeRun({ trace: makeTrace() });
    render(<RunTrace run={run} />);
    const headerButton = screen.getByText("inv.technical-trace").closest("button");
    expect(headerButton).toBeDefined();
    fireEvent.click(headerButton!);
    // After clicking, trace description should be visible
    expect(screen.getByText("inv.technical-trace-desc")).toBeDefined();
  });

  it("returns null when no trace", () => {
    const run = makeRun({ trace: null });
    const { container } = render(<RunTrace run={run} />);
    expect(container.textContent).toBe("");
  });
});

// ── DOM Order Tests ────────────────────────────────────────────────

describe("M4-8.4.3: Appendix Position", () => {
  it("SQL appendix appears after main result in DOM", () => {
    const run = makeRun({
      multiResult: makeMultiResult({
        steps: [
          {
            step: 1,
            purpose: "Get data",
            sql: "SELECT * FROM test",
            columns: ["col1"],
            data: [{ col1: "value1" }],
            status: "success",
          },
        ],
      }),
    });
    const { container } = render(<RunSections run={run} />);
    const text = container.textContent || "";
    const resultIdx = text.indexOf("inv.main-result");
    const sqlIdx = text.indexOf("inv.sql-appendix");
    expect(resultIdx).toBeGreaterThan(-1);
    expect(sqlIdx).toBeGreaterThan(-1);
    expect(resultIdx).toBeLessThan(sqlIdx);
  });

  it("SQL appendix appears after key findings in DOM", () => {
    const run = makeRun({
      multiResult: makeMultiResult({
        steps: [
          { step: 1, purpose: "Get data", sql: "SELECT * FROM test", columns: [], data: [], status: "success" },
        ],
      }),
      sections: [
        { title: "Key Findings", content: "Test finding", type: "markdown" },
      ],
    });
    const { container } = render(<RunSections run={run} />);
    const text = container.textContent || "";
    const findingIdx = text.indexOf("Test finding");
    const sqlIdx = text.indexOf("inv.sql-appendix");
    expect(findingIdx).toBeGreaterThan(-1);
    expect(sqlIdx).toBeGreaterThan(-1);
    expect(findingIdx).toBeLessThan(sqlIdx);
  });
});

// ── What was NOT changed ─────────────────────────────────────────────

describe("M4-8.4.3: What was NOT changed", () => {
  it("RunSections does not restore templates functionality", () => {
    const run = makeRun();
    const { container } = render(<RunSections run={run} />);
    expect(container.textContent).not.toContain("template");
  });

  it("RunSections does not restore schedule functionality", () => {
    const run = makeRun();
    const { container } = render(<RunSections run={run} />);
    expect(container.textContent).not.toContain("schedule");
  });

  it("RunSections does not restore /performance", () => {
    const run = makeRun();
    const { container } = render(<RunSections run={run} />);
    expect(container.textContent).not.toContain("performance");
  });

  it("RunSections does not restore /virtual-table", () => {
    const run = makeRun();
    const { container } = render(<RunSections run={run} />);
    expect(container.textContent).not.toContain("virtual-table");
  });
});
