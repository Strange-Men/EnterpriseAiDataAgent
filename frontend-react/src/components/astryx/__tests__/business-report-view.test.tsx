import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AstryxDataAgentWorkbench, BusinessResult } from "@/components/astryx/astryx-data-agent-workbench";
import type { BusinessAnalysisRecord } from "@/stores/astryx-workbench-store";
import type { AgentBusinessReport } from "@/services/api";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: {
      language: "en",
      changeLanguage: vi.fn(),
    },
    t: (key: string) => {
      const labels: Record<string, string> = {
        "astryx.result.title": "Business answer",
        "astryx.result.executive-summary": "Executive summary",
        "astryx.result.key-findings": "Key findings",
        "astryx.result.evidence-summary": "Evidence summary",
        "astryx.result.risk-priorities": "Risk priorities",
        "astryx.result.recommendations": "Recommendations",
        "astryx.result.limitations": "Limitations",
        "astryx.result.next-questions": "Next questions",
        "astryx.result.risk-high": "High risk",
        "astryx.result.risk-medium": "Medium risk",
        "astryx.result.risk-low": "Low risk",
        "astryx.result.risk-other": "Other risks",
        "astryx.result.answer": "Analysis conclusion",
        "astryx.result.findings": "Key findings",
        "astryx.result.next": "Next questions",
        "astryx.result.data": "Related data",
        "astryx.result.no-data": "No data",
        "astryx.result.warnings": "Risk notes",
        "astryx.result.sql": "View SQL",
        "astryx.result.no-sql": "No SQL",
        "astryx.result.technical": "Technical Details",
        "astryx.result.provider-requested": "Requested model",
        "astryx.result.provider-used": "Model used",
        "astryx.result.fallback-reason": "Fallback reason",
        "astryx.result.record": "Record",
        "astryx.result.none": "None",
        "astryx.status.completed": "Completed",
        "astryx.status.demo": "Demo fallback",
      };
      return labels[key] ?? key;
    },
  }),
}));

vi.mock("@/panels/sql-workspace-panel", () => ({
  SqlWorkspacePanel: () => <div data-testid="sql-workspace-panel" />,
}));

const businessReport: AgentBusinessReport = {
  executive_summary: "Overall revenue is strong, but refund and service risks need priority attention.",
  key_findings: ["South China is high revenue and high risk.", "East China is stable with healthier margin."],
  evidence_summary: [
    { summary: "Total sales reached 12.5M.", metric: "total_sales" },
    { summary: "Refund rate is above the default risk threshold.", metric: "refund_rate" },
  ],
  risk_priorities: [
    { risk_name: "South China refund pressure", risk_level: "high", reason: "High sales and high refund rate." },
    { risk_name: "Promotion dependency", risk_level: "medium", reason: "High discount with low margin." },
  ],
  recommendations: [
    { action: "Audit the top refund products in South China this week.", monitoring_metric: "refund_rate" },
  ],
  limitations: ["ROI cannot be calculated without ad_spend or campaign_cost."],
  next_questions: ["Continue by product category in high-risk regions."],
};

function makeRecord(report: AgentBusinessReport | null = businessReport): BusinessAnalysisRecord {
  return {
    runId: "run-business-1",
    question: "Assess business health.",
    tableName: "demo_sales_business_50k",
    answer: "Legacy answer should not be the primary report when business_report exists.",
    businessReport: report,
    findings: ["Legacy finding"],
    evidencePreview: [],
    sql: "SELECT * FROM revenue",
    warnings: [],
    nextSteps: ["Legacy next question"],
    providerRequested: "doubao",
    providerUsed: "mock",
    fallbackTriggered: false,
    fallbackReason: "provider fallback detail",
    status: "completed",
    createdAt: "2026-07-07T00:00:00.000Z",
    rawRun: {
      run_id: "run-business-1",
      status: "completed",
      answer: "Legacy answer should not be the primary report when business_report exists.",
      business_report: report,
      sql: "SELECT * FROM revenue",
      provider_requested: "doubao",
      provider_used: "mock",
      fallback_reason: "provider fallback detail",
      memory_used: true,
      trace: { step: "hidden trace" },
      tool_calls: [{ tool_name: "compute_overall_kpis" }],
    },
  };
}

describe("M6.6 Business Report frontend adaptation", () => {
  it("renders business_report as the default user-facing report", () => {
    render(<BusinessResult record={makeRecord()} rows={[]} columns={[]} />);

    expect(screen.getByText("Overall revenue is strong, but refund and service risks need priority attention.")).toBeInTheDocument();
    expect(screen.getByText("South China is high revenue and high risk.")).toBeInTheDocument();
    expect(screen.getByText("Total sales reached 12.5M.")).toBeInTheDocument();
    expect(screen.getByText("South China refund pressure")).toBeInTheDocument();
    expect(screen.getByText("Audit the top refund products in South China this week.")).toBeInTheDocument();
    expect(screen.getByText("ROI cannot be calculated without ad_spend or campaign_cost.")).toBeInTheDocument();
    expect(screen.getByText("Continue by product category in high-risk regions.")).toBeInTheDocument();
  });

  it("keeps SQL, trace, tool calls, provider, run id and memory hidden by default", () => {
    render(<BusinessResult record={makeRecord()} rows={[]} columns={[]} />);

    expect(screen.queryByText("SELECT * FROM revenue")).not.toBeInTheDocument();
    expect(screen.queryByText("hidden trace")).not.toBeInTheDocument();
    expect(screen.queryByText("compute_overall_kpis")).not.toBeInTheDocument();
    expect(screen.queryByText("doubao")).not.toBeInTheDocument();
    expect(screen.queryByText("run-business-1")).not.toBeInTheDocument();
    expect(screen.queryByText("memory_used")).not.toBeInTheDocument();
    expect(screen.queryByText("provider fallback detail")).not.toBeInTheDocument();
  });

  it("shows technical details only after the accordion is expanded", () => {
    render(<BusinessResult record={makeRecord()} rows={[]} columns={[]} />);

    fireEvent.click(screen.getByRole("button", { name: "Technical Details" }));

    expect(screen.getByText("SELECT * FROM revenue")).toBeInTheDocument();
    expect(screen.getByText(/compute_overall_kpis/)).toBeInTheDocument();
    expect(screen.getByText(/hidden trace/)).toBeInTheDocument();
    expect(screen.getByText("doubao")).toBeInTheDocument();
    expect(screen.getAllByText("run-business-1").length).toBeGreaterThan(0);
    expect(screen.getByText(/memory_used/)).toBeInTheDocument();
  });

  it("falls back to the legacy answer when business_report is missing", () => {
    render(<BusinessResult record={makeRecord(null)} rows={[]} columns={[]} />);

    expect(screen.getByText("Legacy answer should not be the primary report when business_report exists.")).toBeInTheDocument();
    expect(screen.getByText("Legacy finding")).toBeInTheDocument();
  });

  it("does not crash or render empty headings for an empty business_report", () => {
    render(<BusinessResult record={makeRecord({})} rows={[]} columns={[]} />);

    expect(screen.queryByTestId("business-report-view")).not.toBeInTheDocument();
    expect(screen.getByText("Legacy answer should not be the primary report when business_report exists.")).toBeInTheDocument();
  });

  it("keeps the single-page Astryx workbench shell without Sidebar or five-tab navigation regression", () => {
    const { container } = render(<AstryxDataAgentWorkbench />);

    expect(container.querySelector("[data-astryx-workbench]")).toBeInTheDocument();
    expect(container.textContent).not.toContain("Sidebar");
    expect(container.textContent).not.toContain("Templates");
    expect(container.textContent).not.toContain("Schedule");
    expect(container.textContent).not.toContain("Diff");
    expect(container.textContent).not.toContain("Timeline");
  });
});
