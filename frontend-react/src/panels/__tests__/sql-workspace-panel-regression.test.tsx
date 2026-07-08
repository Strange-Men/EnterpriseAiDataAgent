import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SqlWorkspacePanel } from "../sql-workspace-panel";
import { normalizeQueryTabs, useSqlEditorStore } from "@/stores/sql-editor-store";

const apiMocks = vi.hoisted(() => ({
  aiQuery: vi.fn(),
  executeQuery: vi.fn(),
  explainQuery: vi.fn(),
  cancelQuery: vi.fn(),
  fetchAllSchemas: vi.fn(),
  exportQueryResult: vi.fn(),
  fetchQueryHistory: vi.fn(),
}));

vi.mock("@monaco-editor/react", () => ({
  default: ({ value, onChange, height }: { value: string; onChange: (value: string) => void; height?: string | number }) => (
    <textarea
      aria-label="SQL editor"
      data-height={height}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/ui/data-table", () => ({
  DataTable: ({ data, columns }: { data: Array<Record<string, unknown>>; columns: string[] }) => (
    <div data-testid="mock-data-table">
      {data.length} rows / {columns.length} columns
    </div>
  ),
}));

vi.mock("@/services/api", () => ({
  aiQuery: apiMocks.aiQuery,
  executeQuery: apiMocks.executeQuery,
  explainQuery: apiMocks.explainQuery,
  cancelQuery: apiMocks.cancelQuery,
  fetchAllSchemas: apiMocks.fetchAllSchemas,
  exportQueryResult: apiMocks.exportQueryResult,
  fetchQueryHistory: apiMocks.fetchQueryHistory,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: { language: "en" },
    t: (key: string, params?: Record<string, unknown>) => {
      const labels: Record<string, string> = {
        "tabs.add": "Add query",
        "sql.running": "Running",
        "sql.execute": "Execute",
        "query.cancel": "Cancel",
        "ai.generate-sql": "Generate SQL",
        "ai.generate-sql-hint": "Generate SQL",
        "ai.sql-placeholder": "Describe the SQL you need",
        "ai.generate": "Generate",
        "ai.generating": "Generating",
        "ai.sql-filled": "SQL inserted",
        "sql.ai-gen-failed": "SQL generation failed",
        "sql.ai-gen-error": "SQL generation error",
        "explain.hint": "Explain SQL",
        "explain.button": "Explain",
        "format.hint": "Format SQL",
        "format.button": "Format",
        "export.button": "Export",
        "export.csv": "Export CSV",
        "export.json": "Export JSON",
        "export.excel": "Export Excel",
        "export.exporting": "Exporting",
        "saved.button": "Saved",
        "sql.save": "Save",
        "sql.clear": "Clear",
        "table.cancel": "Cancel",
        "saved.save-title": "Save query",
        "saved.name-placeholder": "Name",
        "saved.save": "Save",
        "saved.title": "Saved queries",
        "sql.empty-title": "No query result",
        "sql.empty-desc": "输入 SQL 查询后按 Ctrl+Enter 执行。",
        "sql.query-ok": `Query completed ${params?.rows ?? ""}`,
        "sql.success-hint": "Editor remains available above the result table.",
        "sql.query-failed": "Query failed",
        "sql.loading-description": "Executing query",
        "sql.loading-hint": "Large results may take a moment.",
        "sql.error-friendly": "The query could not run.",
        "sql.error-guidance": "Check the SQL and try again.",
        "sql.retry": "Retry",
        "sql.error-technical-detail": "Technical detail",
        "sql.empty-result-title": "No rows returned",
        "sql.empty-result-hint": "Try a broader query.",
      };
      return labels[key] ?? key;
    },
  }),
}));

describe("SQL workspace polish regression", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
    useSqlEditorStore.setState({
      tabs: [{ id: "tab-default", name: "Query 1", sql: "", createdAt: "2026-01-01T00:00:00.000Z" }],
      activeTabId: "tab-default",
      currentSql: "",
      isExecuting: false,
      queryResult: null,
      offset: 0,
      limit: 1000,
      totalRows: 0,
      hasMore: false,
      isLoadingMore: false,
      activePanelTab: "editor",
    });
  });

  it("shows an editable SQL editor area by default", () => {
    render(<SqlWorkspacePanel />);

    expect(screen.getByText("Query 1")).toBeInTheDocument();
    expect(screen.getByTestId("sql-editor-shell")).toBeInTheDocument();
    const editor = screen.getByLabelText("SQL editor") as HTMLTextAreaElement;
    expect(editor).toBeInTheDocument();
    expect(editor.dataset.height).toBe("360px");

    fireEvent.change(editor, { target: { value: "SELECT * FROM demo_sales_business_50k LIMIT 10;" } });
    expect(useSqlEditorStore.getState().currentSql).toBe("SELECT * FROM demo_sales_business_50k LIMIT 10;");
  });

  it("inserts AI-generated SQL into the current active Query editor", async () => {
    apiMocks.aiQuery.mockResolvedValue({
      sql: "SELECT region, SUM(sales_amount) AS sales FROM demo_sales_business_50k GROUP BY region;",
      quality_gates: [],
    });

    render(<SqlWorkspacePanel />);

    fireEvent.click(screen.getByRole("button", { name: "Generate SQL" }));
    fireEvent.change(screen.getByPlaceholderText("Describe the SQL you need"), {
      target: { value: "Show sales by region" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    await waitFor(() => {
      expect(screen.getByLabelText("SQL editor")).toHaveValue(
        "SELECT region, SUM(sales_amount) AS sales FROM demo_sales_business_50k GROUP BY region;"
      );
    });
    expect(useSqlEditorStore.getState().getActiveTab()?.name).toBe("Query 1");
  });

  it("inserts AI-generated SQL only into the current active query", async () => {
    apiMocks.aiQuery.mockResolvedValue({
      sql: "SELECT 2 AS active_query_value;",
      quality_gates: [],
    });

    render(<SqlWorkspacePanel />);

    fireEvent.change(screen.getByLabelText("SQL editor"), { target: { value: "SELECT 1 AS first_query_value;" } });
    fireEvent.click(screen.getByRole("button", { name: /Add query/i }));
    expect(screen.getByText("Query 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Generate SQL" }));
    fireEvent.change(screen.getByPlaceholderText("Describe the SQL you need"), {
      target: { value: "Generate SQL for active tab" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    await waitFor(() => {
      expect(screen.getByLabelText("SQL editor")).toHaveValue("SELECT 2 AS active_query_value;");
    });

    fireEvent.click(screen.getByText("Query 1"));
    expect(screen.getByLabelText("SQL editor")).toHaveValue("SELECT 1 AS first_query_value;");
  });

  it("keeps the editor mounted in a separate shell after query results render", async () => {
    apiMocks.executeQuery.mockResolvedValue({
      queryId: "q-1",
      sql: "SELECT region, sales_amount FROM demo_sales_business_50k LIMIT 1;",
      columns: ["region", "sales_amount"],
      data: [{ region: "South China", sales_amount: 100 }],
      rowCount: 1,
      runtimeMs: 12,
      status: "success",
    });

    render(<SqlWorkspacePanel />);

    fireEvent.change(screen.getByLabelText("SQL editor"), {
      target: { value: "SELECT region, sales_amount FROM demo_sales_business_50k LIMIT 1;" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Execute" }));

    await waitFor(() => {
      expect(screen.getByTestId("query-result-container")).toBeInTheDocument();
    });

    expect(screen.getByTestId("sql-editor-shell")).toBeInTheDocument();
    expect(screen.getByLabelText("SQL editor")).toHaveValue(
      "SELECT region, sales_amount FROM demo_sales_business_50k LIMIT 1;"
    );
    expect(screen.getByTestId("query-result-scroll-area")).toBeInTheDocument();
    expect(screen.getByTestId("mock-data-table")).toHaveTextContent("1 rows / 2 columns");
  });

  it("keeps SQL content attached to the right query after switching and deleting tabs", () => {
    render(<SqlWorkspacePanel />);

    const editor = screen.getByLabelText("SQL editor");
    fireEvent.change(editor, { target: { value: "SELECT 1;" } });

    fireEvent.click(screen.getByRole("button", { name: /Add query/i }));
    fireEvent.change(screen.getByLabelText("SQL editor"), { target: { value: "SELECT 2;" } });

    fireEvent.click(screen.getByText("Query 1"));
    expect(screen.getByLabelText("SQL editor")).toHaveValue("SELECT 1;");

    fireEvent.click(screen.getByText("Query 2"));
    expect(screen.getByLabelText("SQL editor")).toHaveValue("SELECT 2;");

    const stateBeforeDelete = useSqlEditorStore.getState();
    stateBeforeDelete.removeTab(stateBeforeDelete.activeTabId);

    const state = useSqlEditorStore.getState();
    expect(state.tabs.map((tab) => tab.name)).toEqual(["Query 1"]);
    expect(state.currentSql).toBe("SELECT 1;");
  });

  it("normalizes a stale single Query 2 tab to Query 1 without losing SQL", () => {
    const normalized = normalizeQueryTabs([
      {
        id: "legacy-tab",
        name: "Query 2",
        sql: "SELECT * FROM legacy_table;",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);

    expect(normalized).toHaveLength(1);
    expect(normalized[0].name).toBe("Query 1");
    expect(normalized[0].sql).toBe("SELECT * FROM legacy_table;");
  });
});
