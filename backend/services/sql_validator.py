"""SQL Validator — read-only query enforcement.

Rejects non-SELECT statements and dangerous operations
to prevent accidental or malicious data modification.
"""

import re

# Statements that modify data or schema
_DDL_KEYWORDS = {"DROP", "ALTER", "CREATE", "TRUNCATE", "RENAME", "COMMENT"}
_DML_KEYWORDS = {"INSERT", "UPDATE", "DELETE", "MERGE", "REPLACE"}
_DANGEROUS_KEYWORDS = {"ATTACH", "INSTALL", "COPY", "EXPORT", "CALL", "PRAGMA"}

# Regex to strip SQL comments and leading whitespace
_COMMENT_RE = re.compile(r"(--.*?$|/\*.*?\*/)", re.MULTILINE | re.DOTALL)


def _strip_comments(sql: str) -> str:
    """Remove SQL comments and normalize whitespace."""
    return _COMMENT_RE.sub("", sql).strip()


def _first_keyword(sql: str) -> str:
    """Extract the first SQL keyword after stripping comments."""
    cleaned = _strip_comments(sql).lstrip("(").strip()
    match = re.match(r"([A-Za-z_]+)", cleaned)
    return match.group(1).upper() if match else ""


def validate_readonly(sql: str) -> tuple[bool, str]:
    """Validate that a SQL query is read-only (SELECT-only).

    Returns:
        (is_valid, error_message) — error_message is empty if valid.
    """
    sql = sql.strip()
    if not sql:
        return False, "Empty SQL query."

    first = _first_keyword(sql)

    # Allow SELECT, WITH (CTE), EXPLAIN, DESCRIBE, SHOW, PRAGMA (read-only)
    _ALLOWED_FIRST = {"SELECT", "WITH", "EXPLAIN", "DESCRIBE", "DESC", "SHOW", "TABLE", "VALUES", "FROM"}
    if first in _ALLOWED_FIRST:
        # Still check for dangerous keywords anywhere in the query
        upper = sql.upper()
        for kw in _DANGEROUS_KEYWORDS:
            # Match keyword as whole word
            if re.search(rf"\b{kw}\b", upper):
                return False, f"Forbidden keyword: {kw}. Only read-only queries are allowed."
        return True, ""

    # Block DDL/DML
    if first in _DDL_KEYWORDS or first in _DML_KEYWORDS:
        return False, f"Statement type not allowed: {first}. Only SELECT queries are permitted."

    # Block anything else we don't recognize
    return False, f"Unsupported statement: {first or '(empty)'}. Only SELECT queries are permitted."
