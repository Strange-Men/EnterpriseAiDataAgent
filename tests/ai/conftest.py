"""Pytest fixtures for AI evaluation tests."""

import pytest
from backend.services.ai_analyst import generate_sql, build_schema_context
from backend.services.data_service import get_executor, list_tables


@pytest.fixture(scope="session")
def ai_available():
    """检查 AI 服务是否可用（需要有效的 API key）。"""
    from backend.config import ANTHROPIC_API_KEY
    if not ANTHROPIC_API_KEY:
        pytest.skip("ANTHROPIC_API_KEY not configured")
    return True


@pytest.fixture(scope="session")
def test_tables():
    """获取测试数据库中的表列表。"""
    return list_tables()


@pytest.fixture(scope="session")
def schema_context(test_tables):
    """构建 schema context 文本。"""
    return build_schema_context(test_tables)


def _generate_sql(question: str, table: str) -> dict:
    """封装 generate_sql 用于评估。"""
    tables = list_tables()
    schema_ctx = build_schema_context(tables)
    return generate_sql(question, schema_ctx)


def _execute_sql(sql: str) -> dict:
    """封装 SQL 执行用于评估。"""
    result = get_executor().execute(sql)
    return {
        "columns": result.get("columns", []),
        "data": result.get("data", [])[:100],  # 限制返回行数
        "row_count": result.get("row_count", 0),
        "status": result.get("status", "error"),
        "error": result.get("error"),
    }


@pytest.fixture(scope="session")
def generate_fn():
    """SQL 生成函数 fixture。"""
    return _generate_sql


@pytest.fixture(scope="session")
def execute_fn():
    """SQL 执行函数 fixture。"""
    return _execute_sql
