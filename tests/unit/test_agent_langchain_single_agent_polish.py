from backend.agent.langchain_single_agent import LangChainSingleAgentService
from backend.agent.pipeline_adapter import execute_readonly_sql_with_existing_executor
from backend.agent.runtime import AgentRuntimeRequest
from backend.agent.tools import ExecuteReadonlySqlInput, get_default_tool_registry


def test_mock_agent_generates_even_row_sql_and_readable_answer() -> None:
    service = LangChainSingleAgentService()

    result = service.run(
        AgentRuntimeRequest(
            user_input="取偶数行",
            table_name="demo_sales",
            provider_requested="mock",
        )
    )

    sql = result.run.sql or ""
    assert "ROW_NUMBER() OVER () AS row_num" in sql
    assert "WHERE row_num % 2 = 0" in sql
    assert "LIMIT 100" in sql
    assert result.run.answer
    assert "演示模型" in result.run.answer
    assert "mock-fallback" not in result.run.answer.lower()
    assert not any("float object cannot be interpreted as an integer" in warning for warning in result.warnings)


def test_mock_agent_generates_region_sales_ranking_sql() -> None:
    service = LangChainSingleAgentService()

    result = service.run(
        AgentRuntimeRequest(
            user_input="不同地区销售额排名",
            table_name="demo_sales",
            provider_requested="mock",
        )
    )

    sql = result.run.sql or ""
    assert "SUM(" in sql
    assert "GROUP BY" in sql
    assert "ORDER BY total_sales DESC" in sql


def test_readonly_sql_row_limit_float_is_coerced_for_mock_and_pipeline() -> None:
    payload = ExecuteReadonlySqlInput.model_validate({"sql": "SELECT * FROM sales", "row_limit": 2.0})
    assert payload.row_limit == 2

    registry = get_default_tool_registry()
    mock_result = registry.call_tool("execute_readonly_sql", {"sql": "SELECT * FROM sales", "row_limit": 2.0})
    assert mock_result.output["row_count"] == 2

    class FakeExecutor:
        def execute(self, sql: str, row_limit: int = 50) -> dict:
            assert isinstance(row_limit, int)
            return {
                "status": "success",
                "sql": sql,
                "row_count": 3,
                "columns": ["id"],
                "rows": [{"id": 1}, {"id": 2}, {"id": 3}],
            }

    result = execute_readonly_sql_with_existing_executor(
        sql="SELECT * FROM sales",
        row_limit=2.0,
        executor=FakeExecutor(),
    )
    assert len(result.output["rows"]) == 2
