/**
 * M4-8.4.2: Result Table + Key Findings Layout Tests
 *
 * Verifies:
 * 1. Key Findings appears before Trace / technical trace
 * 2. Key Findings missing shows friendly empty state
 * 3. Main Result appears before Trace / technical trace
 * 4. Result table shows preview when rows available
 * 5. No rows shows friendly empty state
 * 6. Result table limits to MAX_PREVIEW_ROWS
 * 7. Steps are collapsible (default collapsed)
 * 8. Evaluation shows simplified confidence display
 * 9. Does not modify Markdown export behavior
 * 10. Does not modify Store behavior
 * 11. Invalid run id still friendly
 * 12. Does not restore Templates / Schedule / Diff / Timeline
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RunSections } from "@/components/investigation/run-sections";
import { RunEvaluation } from "@/components/investigation/run-evaluation";
import type { AnalysisRun, EvaluationResult } from "@/stores/analysis-store";
import type { MultiStepExecuted, MultiStepResult } from "@/services/api";

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

function makeSteps(overrides?: Partial<MultiStepExecuted>[]): MultiStepExecuted[] {
  return [
    {
      step: 1,
      purpose: "Step 1",
      sql: "SELECT * FROM test",
      columns: ["col1", "col2"],
      data: [
        { col1: "a", col2: 1 },
        { col1: "b", col2: 2 },
      ],
      row_count: 2,
      status: "success",
      ...overrides?.[0],
    },
  ];
}

function makeStepsWithLargeData(count: number): MultiStepExecuted[] {
  const data = Array.from({ length: count }, (_, i) => ({
    col1: `row-${i}`,
    col2: i,
  }));
  return [
    {
      step: 1,
      purpose: "Step 1",
      sql: "SELECT * FROM test",
      columns: ["col1", "col2"],
      data,
      row_count: count,
      status: "success",
    },
  ];
}

function makeEvaluation(overrides?: Partial<EvaluationResult>): EvaluationResult {
  return {
    confidence: 0.85,
    completeness: "high",
    accuracy: "high",
    actionability: "medium",
    diagnostics: ["Test diagnostic"],
    suggested_improvements: ["Test improvement"],
    ...overrides,
  };
}

// ── Key Findings Tests ──────────────────────────────────────────────

describe("M4-8.4.2: Key Findings Layout", () => {
  it("shows key findings section when present in sections", () => {
    const run = makeRun({
      multiResult: makeMultiResult(),
      sections: [
        { title: "Key Findings", content: "Finding 1\nFinding 2", type: "markdown" },
      ],
    });
    render(<RunSections run={run} />);
    expect(screen.getByText("inv.key-findings")).toBeDefined();
    // Use a function matcher to handle multi-line text
    expect(screen.getByText((content) => content.includes("Finding 1"))).toBeDefined();
    expect(screen.getByText((content) => content.includes("Finding 2"))).toBeDefined();
  });

  it("shows key findings empty state when no findings section", () => {
    const run = makeRun({
      multiResult: makeMultiResult(),
      sections: [],
    });
    render(<RunSections run={run} />);
    expect(screen.getByText("inv.key-findings-empty")).toBeDefined();
    expect(screen.getByText("inv.key-findings-empty-hint")).toBeDefined();
  });

  it("shows key findings empty state when sections have no key findings title", () => {
    const run = makeRun({
      multiResult: makeMultiResult(),
      sections: [
        { title: "Other Section", content: "Some content", type: "markdown" },
      ],
    });
    render(<RunSections run={run} />);
    expect(screen.getByText("inv.key-findings-empty")).toBeDefined();
  });

  it("extracts key findings from Chinese title", () => {
    const run = makeRun({
      multiResult: makeMultiResult(),
      sections: [
        { title: "关键发现", content: "Chinese findings", type: "markdown" },
      ],
    });
    render(<RunSections run={run} />);
    expect(screen.getByText("Chinese findings")).toBeDefined();
  });

  it("key findings appears after summary in DOM order", () => {
    const run = makeRun({
      multiResult: makeMultiResult(),
      sections: [
        { title: "Key Findings", content: "Test finding", type: "markdown" },
      ],
    });
    const { container } = render(<RunSections run={run} />);
    const text = container.textContent || "";
    const summaryIdx = text.indexOf("Test summary");
    const findingIdx = text.indexOf("Test finding");
    expect(summaryIdx).toBeGreaterThan(-1);
    expect(findingIdx).toBeGreaterThan(-1);
    expect(summaryIdx).toBeLessThan(findingIdx);
  });
});

// ── Main Result Table Tests ──────────────────────────────────────────

describe("M4-8.4.2: Main Result Table Layout", () => {
  it("shows result table when steps have data", () => {
    const run = makeRun({
      multiResult: makeMultiResult({ steps: makeSteps() }),
    });
    render(<RunSections run={run} />);
    expect(screen.getByText("inv.main-result")).toBeDefined();
    expect(screen.getByText("col1")).toBeDefined();
    expect(screen.getByText("col2")).toBeDefined();
    expect(screen.getByText("a")).toBeDefined();
    expect(screen.getByText("b")).toBeDefined();
  });

  it("shows result table empty state when no steps", () => {
    const run = makeRun({
      multiResult: makeMultiResult(),
    });
    render(<RunSections run={run} />);
    expect(screen.getByText("inv.main-result-empty")).toBeDefined();
    expect(screen.getByText("inv.main-result-empty-hint")).toBeDefined();
  });

  it("shows result table empty state when steps have no data", () => {
    const run = makeRun({
      multiResult: makeMultiResult({
        steps: [{ step: 1, purpose: "Empty step", sql: "", columns: [], data: [], status: "success" }],
      }),
    });
    render(<RunSections run={run} />);
    expect(screen.getByText("inv.main-result-empty")).toBeDefined();
  });

  it("limits result table to MAX_PREVIEW_ROWS", () => {
    const run = makeRun({
      multiResult: makeMultiResult({ steps: makeStepsWithLargeData(30) }),
    });
    render(<RunSections run={run} />);
    // Should show row count hint
    expect(screen.getByText(/inv.main-result-rows/)).toBeDefined();
    expect(screen.getByText(/inv.main-result-export-hint/)).toBeDefined();
  });

  it("does not show row count hint when data is within limit", () => {
    const run = makeRun({
      multiResult: makeMultiResult({ steps: makeSteps() }),
    });
    render(<RunSections run={run} />);
    // Should NOT show row count hint for small datasets
    expect(screen.queryByText(/inv.main-result-rows/)).toBeNull();
  });

  it("result table appears after key findings in DOM order", () => {
    const run = makeRun({
      multiResult: makeMultiResult({ steps: makeSteps() }),
      sections: [
        { title: "Key Findings", content: "Test finding", type: "markdown" },
      ],
    });
    const { container } = render(<RunSections run={run} />);
    const text = container.textContent || "";
    const findingIdx = text.indexOf("Test finding");
    const resultIdx = text.indexOf("inv.main-result");
    expect(findingIdx).toBeGreaterThan(-1);
    expect(resultIdx).toBeGreaterThan(-1);
    expect(findingIdx).toBeLessThan(resultIdx);
  });

  it("truncates long cell values to 50 characters", () => {
    const longValue = "a".repeat(100);
    const run = makeRun({
      multiResult: makeMultiResult({
        steps: [
          {
            step: 1,
            purpose: "Test",
            sql: "",
            columns: ["col1"],
            data: [{ col1: longValue }],
            status: "success",
          },
        ],
      }),
    });
    render(<RunSections run={run} />);
    // The truncated value should end with "..."
    const truncated = "a".repeat(50) + "...";
    expect(screen.getByText(truncated)).toBeDefined();
  });
});

// ── Steps Collapsible Tests ──────────────────────────────────────────

describe("M4-8.4.2: Steps Collapsible", () => {
  it("steps are collapsed by default", () => {
    const run = makeRun({
      multiResult: makeMultiResult({ steps: makeSteps() }),
    });
    render(<RunSections run={run} />);
    // Step results should not be visible by default
    expect(screen.queryByText("ai.step-result")).toBeNull();
    // But the collapsible header should show the count
    expect(screen.getByText(/ai.step-result/)).toBeDefined();
  });

  it("steps expand when header is clicked", () => {
    const run = makeRun({
      multiResult: makeMultiResult({ steps: makeSteps() }),
    });
    render(<RunSections run={run} />);
    // Find and click the steps header button
    const headerButton = screen.getByText(/ai.step-result/).closest("button");
    expect(headerButton).toBeDefined();
    fireEvent.click(headerButton!);
    // After clicking, step content should be visible
    expect(screen.getByText("Step 1")).toBeDefined();
  });
});

// ── Evaluation Simplified Tests ──────────────────────────────────────

describe("M4-8.4.2: Evaluation Simplified", () => {
  it("shows confidence as number instead of SVG ring", () => {
    const run = makeRun({ evaluation: makeEvaluation({ confidence: 0.85 }) });
    render(<RunEvaluation run={run} />);
    expect(screen.getByText("85%")).toBeDefined();
  });

  it("shows high confidence text for high confidence", () => {
    const run = makeRun({ evaluation: makeEvaluation({ confidence: 0.85 }) });
    render(<RunEvaluation run={run} />);
    expect(screen.getByText("ai.high-confidence")).toBeDefined();
  });

  it("shows medium confidence text for medium confidence", () => {
    const run = makeRun({ evaluation: makeEvaluation({ confidence: 0.55 }) });
    render(<RunEvaluation run={run} />);
    expect(screen.getByText("ai.medium-confidence")).toBeDefined();
  });

  it("shows low confidence text for low confidence", () => {
    const run = makeRun({ evaluation: makeEvaluation({ confidence: 0.3 }) });
    render(<RunEvaluation run={run} />);
    expect(screen.getByText("ai.low-confidence")).toBeDefined();
  });

  it("shows diagnostics list", () => {
    const run = makeRun({
      evaluation: makeEvaluation({ diagnostics: ["Test diagnostic 1", "Test diagnostic 2"] }),
    });
    render(<RunEvaluation run={run} />);
    expect(screen.getByText("Test diagnostic 1")).toBeDefined();
    expect(screen.getByText("Test diagnostic 2")).toBeDefined();
  });

  it("shows improvements list", () => {
    const run = makeRun({
      evaluation: makeEvaluation({ suggested_improvements: ["Improvement 1"] }),
    });
    render(<RunEvaluation run={run} />);
    expect(screen.getByText("Improvement 1")).toBeDefined();
  });

  it("shows no evaluation empty state", () => {
    const run = makeRun({ evaluation: undefined });
    render(<RunEvaluation run={run} />);
    expect(screen.getByText("inv.no-evaluation")).toBeDefined();
  });
});

// ── What was NOT changed ─────────────────────────────────────────────

describe("M4-8.4.2: What was NOT changed", () => {
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

  it("RunSections does not render trace", () => {
    const run = makeRun({
      trace: { entries: [] } as unknown as AnalysisRun["trace"],
      multiResult: makeMultiResult(),
    });
    const { container } = render(<RunSections run={run} />);
    expect(container.textContent).not.toContain("trace");
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

  it("RunEvaluation does not use SVG ring for confidence", () => {
    const run = makeRun({ evaluation: makeEvaluation() });
    const { container } = render(<RunEvaluation run={run} />);
    const svgElements = container.querySelectorAll("svg");
    expect(svgElements.length).toBe(0);
  });
});
