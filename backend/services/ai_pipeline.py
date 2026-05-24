"""AI Pipeline — orchestrates the NL → SQL → Execute → Explain flow."""

from backend.services.ai_analyst import (
    generate_sql,
    explain_results,
    build_schema_context,
)
from backend.services.data_service import _executor, _sanitize_for_json, list_tables


def run_ai_query(question: str, execute: bool = True, explain: bool = True, max_rows: int = 1000) -> dict:
    """Natural language → SQL → Execute → Explain pipeline.

    Returns a dict with keys: question, sql, status, columns, data, explanation, etc.
    """
    question = question.strip()
    if not question:
        return {"question": "", "sql": "", "error": "Empty question", "status": "error"}

    # 1. Build schema context
    tables = list_tables()
    schema_context = build_schema_context(tables)

    # 2. Generate SQL
    sql_result = generate_sql(question, schema_context)
    if sql_result["status"] == "error":
        return {
            "question": question,
            "sql": "",
            "error": sql_result.get("error", "Failed to generate SQL"),
            "status": "error",
            "generation_ms": sql_result.get("elapsed_ms", 0),
        }

    sql = sql_result["sql"]

    # Check if the model determined the question can't be answered
    if sql.startswith("-- CANNOT_ANSWER"):
        return {
            "question": question,
            "sql": sql,
            "error": sql.replace("-- CANNOT_ANSWER:", "").strip(),
            "status": "cannot_answer",
            "generation_ms": sql_result["elapsed_ms"],
        }

    response = {
        "question": question,
        "sql": sql,
        "status": "success",
        "generation_ms": sql_result["elapsed_ms"],
    }

    # 3. Execute SQL (if requested)
    if execute:
        exec_result = _executor.execute(sql)
        if exec_result["status"] == "error":
            response["execution_error"] = exec_result["error"]
            response["status"] = "sql_error"
            return response

        data = _sanitize_for_json(exec_result["data"][:max_rows])
        response["columns"] = exec_result["columns"]
        response["data"] = data
        response["rowCount"] = exec_result["row_count"]
        response["truncated"] = exec_result["row_count"] > max_rows

        # 4. Explain results (if requested and we have data)
        if explain and data:
            explanation = explain_results(question, sql, data)
            response["explanation"] = explanation.get("explanation", "")
            response["explanation_ms"] = explanation.get("elapsed_ms", 0)

    return response
