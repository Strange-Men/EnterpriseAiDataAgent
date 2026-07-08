import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SqlWorkspacePanel } from "../sql-workspace-panel";
import { useSqlEditorStore } from "@/stores/sql-editor-store";

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
        "sql.query-failed": "Query failed",
      };
      return labels[key] ?? key;
    },
  }),
}));

describe("SQL workspace polish regression", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
