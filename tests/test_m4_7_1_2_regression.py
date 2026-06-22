"""M4-7.1.2 Browser Regression Hotfix — regression tests.

验证:
1. 空 SQL 转为 skipped 时使用用户友好消息
2. Guardrails 默认值匹配 3 步限制
3. Planner prompt 强调 1-3 步
4. CANNOT_ANSWER 消息用户友好
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.utils.llm_sql import extract_sql_from_llm_output
from backend.services.guardrails import AnalysisGuardrails, DEFAULT_GUARDRAILS, STRICT_GUARDRAILS
from backend.prompts.analysis_plan import SYSTEM_PROMPT, CONTRACT, build_user_message


class TestEmptySqlFriendlyMessage:
    """空 SQL 应生成用户友好的 CANNOT_ANSWER 消息。"""

    def test_empty_string_becomes_friendly_cannot_answer(self):
        sql = extract_sql_from_llm_output("")
        assert sql.startswith("-- CANNOT_ANSWER")
        assert "Model returned an empty SQL response" not in sql
        assert "字段" in sql or "field" in sql.lower() or "cannot" in sql.lower()

    def test_whitespace_only_becomes_friendly_cannot_answer(self):
        sql = extract_sql_from_llm_output("   \n  \t  ")
        assert sql.startswith("-- CANNOT_ANSWER")

    def test_none_becomes_friendly_cannot_answer(self):
        sql = extract_sql_from_llm_output(None)
        assert sql.startswith("-- CANNOT_ANSWER")


class TestGuardrailsMatchPlanner:
    """Guardrails 默认值应与 planner 限制一致。"""

    def test_default_max_steps_is_3(self):
        assert DEFAULT_GUARDRAILS.max_steps == 3

    def test_default_max_sql_queries_is_4(self):
        assert DEFAULT_GUARDRAILS.max_sql_queries == 4

    def test_strict_max_steps_is_2(self):
        assert STRICT_GUARDRAILS.max_steps == 2

    def test_strict_max_sql_queries_is_3(self):
        assert STRICT_GUARDRAILS.max_sql_queries == 3

    def test_custom_guardrails_can_override(self):
        g = AnalysisGuardrails(max_steps=1, max_sql_queries=1)
        assert g.max_steps == 1
        assert g.max_sql_queries == 1


class TestPlannerPromptQuality:
    """Planner prompt 应强调 1-3 步，不鼓励过度扩展。"""

    def test_contract_says_1_to_3_steps(self):
        assert "1-3" in CONTRACT.purpose

    def test_prompt_says_1_to_3_steps(self):
        assert "1-3" in SYSTEM_PROMPT

    def test_prompt_does_not_say_3_to_6(self):
        assert "3-6" not in SYSTEM_PROMPT

    def test_prompt_says_max_3(self):
        assert "Maximum 3" in SYSTEM_PROMPT

    def test_prompt_emphasizes_direct_answer(self):
        assert "directly answer" in SYSTEM_PROMPT.lower() or "FIRST step" in SYSTEM_PROMPT

    def test_prompt_discourages_padding(self):
        assert "quota" in SYSTEM_PROMPT.lower() or "pad" in SYSTEM_PROMPT.lower()

    def test_prompt_only_references_existing_columns(self):
        assert "actually exist in the schema" in SYSTEM_PROMPT
        assert "Do NOT invent columns" in SYSTEM_PROMPT


class TestBuildUserMessage:
    """build_user_message 应包含 schema 约束。"""

    def test_message_includes_column_list(self):
        msg = build_user_message(
            question="test",
            table="sales",
            columns=[{"name": "region", "dtype": "VARCHAR"}, {"name": "amount", "dtype": "DOUBLE"}],
            sample_rows=[{"region": "East", "amount": 100}],
        )
        assert "region" in msg
        assert "amount" in msg
        assert "ONLY use these" in msg

    def test_message_warns_about_missing_fields(self):
        msg = build_user_message(
            question="test",
            table="sales",
            columns=[{"name": "region", "dtype": "VARCHAR"}],
            sample_rows=[],
        )
        assert "do NOT create steps for those fields" in msg


class TestSkippedStepMessages:
    """Skipped 步骤的错误消息应用户友好。"""

    def test_cannot_answer_is_user_friendly(self):
        """CANNOT_ANSWER 消息不应包含技术术语如 'Model returned'。"""
        sql = extract_sql_from_llm_output("")
        # 消息应该是中文友好描述
        assert "字段" in sql or "数据" in sql

    def test_non_sql_text_cannot_answer(self):
        """非 SQL 文本的 CANNOT_ANSWER 也应友好。"""
        sql = extract_sql_from_llm_output("I cannot answer this question.")
        assert sql.startswith("-- CANNOT_ANSWER")
