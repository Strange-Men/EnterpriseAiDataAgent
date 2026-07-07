import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AstryxDataAgentWorkbench } from "@/components/astryx/astryx-data-agent-workbench";
import { useAstryxWorkbenchStore } from "@/stores/astryx-workbench-store";
import { useDataStore } from "@/stores/data-store";
import { useInvestigationStore } from "@/stores/investigation-store";

const apiMocks = vi.hoisted(() => ({
  clearSessionState: vi.fn(),
  createAgentRun: vi.fn(),
  fetchQualityReport: vi.fn(),
  fetchSessionTableState: vi.fn(),
  fetchTableData: vi.fn(),
  fetchTables: vi.fn(),
  fetchUploadTaskStatus: vi.fn(),
  startUploadTask: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  clearSessionState: apiMocks.clearSessionState,
  createAgentRun: apiMocks.createAgentRun,
  fetchQualityReport: apiMocks.fetchQualityReport,
  fetchSessionTableState: apiMocks.fetchSessionTableState,
  fetchTableData: apiMocks.fetchTableData,
  fetchTables: apiMocks.fetchTables,
  fetchUploadTaskStatus: apiMocks.fetchUploadTaskStatus,
  startUploadTask: apiMocks.startUploadTask,
}));

vi.mock("@/panels/sql-workspace-panel", () => ({
  SqlWorkspacePanel: () => <div data-testid="sql-workspace-panel" />,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: {
      language: "en",
      changeLanguage: vi.fn(),
    },
    t: (key: string) => {
      const labels: Record<string, string> = {
        "astryx.app-title": "Data analysis workspace",
        "astryx.header.table": "Current table",
        "astryx.history.button": "History",
        "astryx.settings.button": "Settings",
        "astryx.settings.title": "Settings",
        "astryx.settings.provider": "Model",
        "astryx.settings.provider-hint": "Provider hint",
        "astryx.settings.fallback": "Mock fallback",
        "astryx.settings.fallback-desc": "Fallback desc",
        "astryx.settings.reset-session": "Reset session",
        "astryx.language.zh": "Chinese",
        "astryx.language.en": "English",
        "astryx.drawer.close": "Close",
        "astryx.brand-pill": "Business data agent",
        "astryx.hero.title": "Upload and ask",
        "astryx.hero.subtitle": "Business answer first.",
        "astryx.metric.table": "Current table",
        "astryx.metric.rows": "Rows",
        "astryx.metric.records": "Saved analyses",
        "astryx.empty.table": "No table selected",
        "astryx.data.title": "Data context",
        "astryx.data.drop-title": "Upload CSV/Excel",
        "astryx.data.drop-desc": "Choose a spreadsheet.",
        "astryx.data.current": "Current table",
        "astryx.data.columns": "Fields",
        "astryx.data.rows": "Rows",
        "astryx.quality.empty": "Quality empty",
        "astryx.ask.title": "Ask Agent",
        "astryx.ask.placeholder": "Ask",
        "astryx.ask.helper": "Helper",
        "astryx.ask.submit": "Start Analysis",
        "astryx.example.region": "Rank sales by region.",
        "astryx.example.top": "Find top products.",
        "astryx.example.refund": "Refund risk.",
        "astryx.example.even": "Even rows.",
        "astryx.result.title": "Business answer",
        "astryx.result.empty-title": "Your answer will appear here",
        "astryx.result.empty-desc": "No old answer on first load.",
        "astryx.history.title": "Analysis records",
        "astryx.history.empty": "No analysis records yet.",
        "astryx.expert.title": "Advanced SQL tools",
        "astryx.expert.desc": "Technical users only.",
        "astryx.upload.stage.uploading": "Uploading",
        "astryx.upload.stage.parsing": "Parsing",
        "astryx.upload.stage.loading": "Loading into database",
        "astryx.upload.stage.profiling": "Building data profile",
        "astryx.upload.stage.done": "Upload complete",
        "astryx.upload.stage.failed": "Upload failed",
        "astryx.error.upload": "Upload failed.",
        "astryx.error.upload-timeout": "Upload timed out.",
        "astryx.error.table-load": "Could not load table.",
      };
      return labels[key] ?? key;
    },
  }),
}));

const defaultTable = {
  name: "demo_sales_business_50k",
  rowCount: 50000,
  columnCount: 28,
};

const uploadedTable = {
  name: "uploaded_orders",
  rowCount: 2,
  columnCount: 2,
};

function resetStores() {
  localStorage.clear();
  useDataStore.setState({
    tables: [],
    currentData: null,
    currentColumns: [],
    qualityReport: null,
    qualityReports: {},
    uploadedFiles: [],
  });
  useInvestigationStore.setState({
    activeTable: null,
    turns: [],
    compressedSummary: null,
    keyFindings: [],
    investigationSummary: null,
    lastColumns: null,
    lastRowCount: null,
    lastSql: null,
    lastInsightSummary: null,
    drillChain: [],
  });
  useAstryxWorkbenchStore.setState({
    records: [],
    activeRunId: null,
    provider: "mock",
  });
}

function setupDefaultApi() {
  apiMocks.fetchSessionTableState.mockResolvedValue({
    app_default_table: "demo_sales_business_50k",
    current_table: "demo_sales_business_50k",
    user_active_table: "demo_sales_business_50k",
  });
  apiMocks.fetchTables.mockResolvedValue([defaultTable]);
  apiMocks.fetchTableData.mockResolvedValue({ columns: ["order_id"], data: [{ order_id: "o-1" }] });
  apiMocks.fetchQualityReport.mockResolvedValue({ overallScore: 92, warnings: [] });
  apiMocks.clearSessionState.mockResolvedValue({
    ok: true,
    app_default_table: "demo_sales_business_50k",
    current_table: "demo_sales_business_50k",
    user_active_table: "demo_sales_business_50k",
  });
}

function uploadFile(container: HTMLElement) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  const file = new File(["id,name\n1,Alice"], "uploaded_orders.csv", { type: "text/csv" });
  fireEvent.change(input, { target: { files: [file] } });
}

describe("M6 Manual Fix 1 workbench defaults and async upload", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    resetStores();
    setupDefaultApi();
  });

  it("shows the M6 business demo table by default and keeps old history out of the main answer", async () => {
    useAstryxWorkbenchStore.setState({
      records: [
        {
          runId: "old-run",
          question: "Old question",
          tableName: "demo_sales_business_50k",
          answer: "Old answer should stay hidden",
          businessReport: null,
          findings: ["Old finding"],
          evidencePreview: [],
          sql: null,
          warnings: [],
          nextSteps: [],
          providerRequested: "mock",
          providerUsed: "mock",
          fallbackTriggered: false,
          fallbackReason: null,
          status: "completed",
          createdAt: "2026-07-07T00:00:00.000Z",
          rawRun: { run_id: "old-run", status: "completed" },
        },
      ],
      activeRunId: "old-run",
    });

    render(<AstryxDataAgentWorkbench />);

    await waitFor(() => expect(screen.getAllByText(/demo_sales_business_50k/).length).toBeGreaterThan(0));
    expect(screen.queryByText("Old answer should stay hidden")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "History" }));
    expect(await screen.findByText("Old question")).toBeInTheDocument();
  });

  it("does not expose a light mode entry in settings", async () => {
    render(<AstryxDataAgentWorkbench />);
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));

    expect(await screen.findByText("Reset session")).toBeInTheDocument();
    expect(screen.queryByText("Light")).not.toBeInTheDocument();
  });

  it("polls upload task status and switches to the uploaded table on success", async () => {
    apiMocks.startUploadTask.mockResolvedValue({
      task_id: "task-1",
      status: "running",
      progress: 10,
      stage: "parsing",
    });
    apiMocks.fetchUploadTaskStatus.mockResolvedValue({
      task_id: "task-1",
      status: "success",
      progress: 100,
      stage: "done",
      table_name: "uploaded_orders",
      error_message: null,
    });
    const { container } = render(<AstryxDataAgentWorkbench />);
    await waitFor(() => expect(apiMocks.fetchSessionTableState).toHaveBeenCalled());
    apiMocks.fetchTables.mockResolvedValue([defaultTable, uploadedTable]);

    uploadFile(container);
    expect(await screen.findByText("Parsing")).toBeInTheDocument();

    await waitFor(() => expect(apiMocks.fetchUploadTaskStatus).toHaveBeenCalledWith("task-1"), { timeout: 4_000 });
    await waitFor(() => expect(screen.getAllByText(/uploaded_orders/).length).toBeGreaterThan(0), { timeout: 4_000 });
  }, 10_000);

  it("shows task failure reason instead of infinite loading", async () => {
    apiMocks.startUploadTask.mockResolvedValue({
      task_id: "task-failed",
      status: "running",
      progress: 10,
      stage: "parsing",
    });
    apiMocks.fetchUploadTaskStatus.mockResolvedValue({
      task_id: "task-failed",
      status: "failed",
      progress: 100,
      stage: "failed",
      table_name: null,
      error_message: "File processing failed clearly.",
    });

    const { container } = render(<AstryxDataAgentWorkbench />);
    await waitFor(() => expect(apiMocks.fetchSessionTableState).toHaveBeenCalled());

    uploadFile(container);

    await waitFor(() => expect(document.body.textContent).toContain("File processing failed clearly."), { timeout: 4_000 });
    expect(screen.getByText("100%")).toBeInTheDocument();
  }, 10_000);

  it("calls backend clear session and returns to the default demo table", async () => {
    render(<AstryxDataAgentWorkbench />);
    await waitFor(() => expect(screen.getAllByText(/demo_sales_business_50k/).length).toBeGreaterThan(0));

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    fireEvent.click(await screen.findByRole("button", { name: "Reset session" }));

    await waitFor(() => expect(apiMocks.clearSessionState).toHaveBeenCalled());
    expect(useAstryxWorkbenchStore.getState().activeRunId).toBeNull();
    expect(useInvestigationStore.getState().activeTable).toBe("demo_sales_business_50k");
  });
});
