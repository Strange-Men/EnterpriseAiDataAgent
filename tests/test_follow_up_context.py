"""Tests for enhanced build_follow_up_context()."""

import pytest
from backend.services.ai_analyst import build_follow_up_context


class TestBuildFollowUpContext:
    """测试增强版 build_follow_up_context 函数。"""

    def test_backward_compatibility_legacy_fields(self):
        """仅使用旧字段 — 应保持向后兼容。"""
        ctx = {
            "previous_sql": "SELECT COUNT(*) FROM sales",
            "previous_result_schema": [{"name": "count", "dtype": "INTEGER"}],
            "previous_sample_rows": [{"count": 42}],
            "previous_insight_summary": "Total sales count is 42.",
        }
        result = build_follow_up_context(ctx)
        assert "=== PREVIOUS ANALYSIS CONTEXT ===" in result
        assert "SELECT COUNT(*) FROM sales" in result
        assert "count (INTEGER)" in result
        assert "Total sales count is 42." in result

    def test_empty_context(self):
        """空上下文应返回 header。"""
        result = build_follow_up_context({})
        assert "=== PREVIOUS ANALYSIS CONTEXT ===" in result

    def test_prior_key_findings_rendered(self):
        """prior_key_findings 应作为编号列表渲染。"""
        ctx = {
            "prior_key_findings": [
                "Revenue increased 20% YoY",
                "Customer churn rate is 5%",
            ],
        }
        result = build_follow_up_context(ctx)
        assert "Prior Key Findings:" in result
        assert "1. Revenue increased 20% YoY" in result
        assert "2. Customer churn rate is 5%" in result

    def test_prior_key_findings_capped_at_5(self):
        """超过 5 个 findings 应截断。"""
        ctx = {
            "prior_key_findings": [f"Finding {i}" for i in range(8)],
        }
        result = build_follow_up_context(ctx)
        assert "5. Finding 4" in result
        assert "6. Finding 5" not in result

    def test_investigation_summary_present(self):
        """investigation_summary 应显示。"""
        ctx = {
            "investigation_summary": "Thread: analyzing Q3 revenue decline across regions.",
        }
        result = build_follow_up_context(ctx)
        assert "Investigation Thread Summary:" in result
        assert "Q3 revenue decline" in result

    def test_investigation_summary_truncates_previous_insight(self):
        """有 investigation_summary 时，previous_insight_summary 截断到 200 字符。"""
        long_summary = "A" * 300
        ctx = {
            "investigation_summary": "Thread summary here.",
            "previous_insight_summary": long_summary,
        }
        result = build_follow_up_context(ctx)
        # Should be truncated to 200 + "..."
        assert "A" * 200 + "..." in result
        assert "A" * 300 not in result

    def test_no_investigation_summary_keeps_long_insight(self):
        """无 investigation_summary 时，previous_insight_summary 截断到 500 字符。"""
        long_summary = "B" * 600
        ctx = {"previous_insight_summary": long_summary}
        result = build_follow_up_context(ctx)
        assert "B" * 500 + "..." in result

    def test_all_enhanced_fields_together(self):
        """所有字段一起使用。"""
        ctx = {
            "previous_sql": "SELECT * FROM orders",
            "previous_result_schema": [{"name": "id", "dtype": "INTEGER"}],
            "previous_sample_rows": [{"id": 1}],
            "previous_insight_summary": "Short summary.",
            "prior_key_findings": ["Finding A", "Finding B"],
            "investigation_summary": "Thread about orders.",
        }
        result = build_follow_up_context(ctx)
        assert "Previous SQL:" in result
        assert "Previous Result Schema:" in result
        assert "Previous Result Sample" in result
        assert "Prior Key Findings:" in result
        assert "1. Finding A" in result
        assert "Investigation Thread Summary:" in result
        assert "Short summary." in result

    def test_token_budget_range(self):
        """输出应在合理的 token 预算范围内（~220-600 tokens）。"""
        # Build a reasonably large context
        ctx = {
            "previous_sql": "SELECT region, SUM(amount) as total FROM sales GROUP BY region ORDER BY total DESC",
            "previous_result_schema": [
                {"name": "region", "dtype": "VARCHAR"},
                {"name": "total", "dtype": "DOUBLE"},
            ],
            "previous_sample_rows": [
                {"region": f"Region{i}", "total": 1000 * i} for i in range(5)
            ],
            "previous_insight_summary": "Regional analysis shows concentration in top 3 regions.",
            "prior_key_findings": [
                "Revenue grew 15% in Q3",
                "North region dominates with 40% share",
                "South region declining since Q1",
            ],
            "investigation_summary": "Investigating regional revenue trends and anomalies.",
        }
        result = build_follow_up_context(ctx)
        # Token estimate: len // 3
        estimated_tokens = len(result) // 3
        assert estimated_tokens < 800, f"Context too large: ~{estimated_tokens} tokens"
        assert estimated_tokens > 50, f"Context too small: ~{estimated_tokens} tokens"

    def test_prior_key_findings_empty_list(self):
        """空列表不应渲染 findings 部分。"""
        ctx = {"prior_key_findings": []}
        result = build_follow_up_context(ctx)
        assert "Prior Key Findings:" not in result

    def test_prior_key_findings_none(self):
        """None 不应报错。"""
        ctx = {"prior_key_findings": None}
        result = build_follow_up_context(ctx)
        assert "Prior Key Findings:" not in result

    def test_sample_rows_capped_at_5(self):
        """sample_rows 截断到 5 行。"""
        ctx = {
            "previous_sample_rows": [{"id": i} for i in range(10)],
        }
        result = build_follow_up_context(ctx)
        assert '"id": 4' in result
        assert '"id": 5' not in result
