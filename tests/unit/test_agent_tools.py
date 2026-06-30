from pathlib import Path
import sys

import pytest

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.agent.contracts import ToolResult, ToolResultStatus
from backend.agent.tools import ToolValidationError, get_default_tool_registry, list_tool_names, validate_readonly_sql


def test_registry_contains_only_m5_1_3_tools() -> None:
    registry = get_default_tool_registry()
    names = [tool.name for tool in registry.list_tools()]

    assert names == ["execute_readonly_sql", "inspect_schema", "profile_table"]
    assert list_tool_names() == names
    assert registry.has_tool("inspect_schema")
    assert registry.has_tool("profile_table")
    assert registry.has_tool("execute_readonly_sql")

    for future_tool in (
        "generate_sql",
        "summarize_findings",
        "build_report",
        "detect_anomalies",
        "suggest_chart",
    ):
        assert not registry.has_tool(future_tool)


def test_registry_get_tool_returns_definition() -> None:
    registry = get_default_tool_registry()

    tool = registry.get_tool("inspect_schema")

    assert tool.name == "inspect_schema"
    assert tool.is_mock is True
    assert tool.requires_readonly_sql is False


def test_registry_unknown_tool_raises_validation_error() -> None:
    registry = get_default_tool_registry()

    with pytest.raises(ToolValidationError):
        registry.get_tool("unknown_tool")

    with pytest.raises(ToolValidationError):
        registry.call_tool("unknown_tool", {})


def test_inspect_schema_uses_deterministic_sample_schema() -> None:
    registry = get_default_tool_registry()

    result = registry.call_tool("inspect_schema", {"table_name": "sales"})

    assert isinstance(result, ToolResult)
    assert result.status == ToolResultStatus.COMPLETED
    assert result.is_simulated is True
    assert result.output["table_name"] == "sales"
    assert result.output["column_count"] > 0
    assert [column["name"] for column in result.output["columns"]] == ["date", "channel", "revenue", "orders"]
    assert isinstance(result.evidence_refs, list)
    assert result.duration_ms is not None and result.duration_ms >= 0


def test_inspect_schema_preserves_provided_columns() -> None:
    registry = get_default_tool_registry()
    columns = [{"name": "customer_id", "type": "VARCHAR"}, {"name": "amount", "type": "DOUBLE"}]

    result = registry.call_tool("inspect_schema", {"table_name": "customers", "columns": columns})

    assert result.output["columns"] == columns
    assert result.output["column_count"] == 2


def test_profile_table_uses_requested_row_count_and_default_numeric_columns() -> None:
    registry = get_default_tool_registry()

    result = registry.call_tool("profile_table", {"table_name": "sales", "row_count": 10})

    assert result.status == ToolResultStatus.COMPLETED
    assert result.is_simulated is True
    assert result.output["row_count"] == 10
    assert result.output["missing_values_summary"] == {}
    assert "revenue" in result.output["numeric_columns"]
    assert "orders" in result.output["numeric_columns"]


def test_profile_table_infers_numeric_columns_from_provided_columns() -> None:
    registry = get_default_tool_registry()
    columns = [
        {"name": "region", "type": "VARCHAR"},
        {"name": "gross_margin", "type": "DECIMAL"},
        {"name": "orders", "type": "INTEGER"},
    ]

    result = registry.call_tool("profile_table", {"table_name": "sales", "columns": columns})

    assert result.output["numeric_columns"] == ["gross_margin", "orders"]
    assert result.output["row_count"] == 3


@pytest.mark.parametrize(
    "sql",
    [
        "SELECT * FROM sales",
        "WITH q AS (SELECT * FROM sales) SELECT * FROM q",
        "select channel, count(*) from sales group by channel",
    ],
)
def test_execute_readonly_sql_accepts_readonly_queries(sql: str) -> None:
    registry = get_default_tool_registry()

    result = registry.call_tool("execute_readonly_sql", {"sql": sql})

    assert result.status == ToolResultStatus.COMPLETED
    assert result.is_simulated is True
    assert result.output["sql"] == sql
    assert result.output["row_count"] == 3
    assert result.output["columns"] == ["date", "channel", "revenue", "orders"]


def test_execute_readonly_sql_applies_row_limit() -> None:
    registry = get_default_tool_registry()

    result = registry.call_tool("execute_readonly_sql", {"sql": "SELECT * FROM sales", "row_limit": 1})

    assert len(result.output["rows"]) <= 1
    assert result.output["row_count"] == 1


@pytest.mark.parametrize(
    "sql",
    [
        "DROP TABLE sales",
        "DELETE FROM sales",
        "UPDATE sales SET revenue = 0",
        "INSERT INTO sales VALUES (1)",
        "ALTER TABLE sales ADD COLUMN x INT",
        "CREATE TABLE x AS SELECT 1",
        "TRUNCATE TABLE sales",
        "COPY sales TO 'x.csv'",
        "PRAGMA table_info(sales)",
        "SELECT * FROM sales; DROP TABLE sales",
        "SELECT * FROM sales /* DROP TABLE sales */",
    ],
)
def test_readonly_sql_rejects_dangerous_statements(sql: str) -> None:
    with pytest.raises(ToolValidationError):
        validate_readonly_sql(sql)

    registry = get_default_tool_registry()
    with pytest.raises(ToolValidationError):
        registry.call_tool("execute_readonly_sql", {"sql": sql})


def test_readonly_sql_rejects_empty_sql() -> None:
    with pytest.raises(ToolValidationError):
        validate_readonly_sql("")


@pytest.mark.parametrize(
    "tool_name,input_data",
    [
        ("inspect_schema", {"table_name": ""}),
        ("profile_table", {"table_name": ""}),
        ("execute_readonly_sql", {"sql": ""}),
        ("execute_readonly_sql", {"sql": "SELECT * FROM sales", "row_limit": 0}),
    ],
)
def test_tool_input_validation(tool_name: str, input_data: dict[str, object]) -> None:
    registry = get_default_tool_registry()

    with pytest.raises(ToolValidationError):
        registry.call_tool(tool_name, input_data)


def test_tools_source_has_no_forbidden_dependency_imports() -> None:
    source = (ROOT / "backend" / "agent" / "tools.py").read_text(encoding="utf-8")
    forbidden = [
        "ai_pipeline",
        "ai_analyst",
        "backend.routes",
        "duckdb",
        "pandas",
        "requests",
        "httpx",
        "openai",
        "lang" + "chain",
        "lang" + "graph",
    ]

    for name in forbidden:
        assert name not in source


def test_tool_result_serializes_to_json() -> None:
    registry = get_default_tool_registry()

    result = registry.call_tool("inspect_schema", {"table_name": "sales"})

    dumped = result.model_dump(mode="json")
    json_text = result.model_dump_json()

    assert dumped["is_simulated"] is True
    assert "inspect_schema" in json_text
