"""Validation utilities — input sanitization for security.

Provides:
- Table name validation (prevent SQL injection)
- Error message sanitization (prevent internal info leakage)
"""

import re
import logging

logger = logging.getLogger("enterprise_ai.validation")

# Only allow alphanumeric, underscore, and dot (for schema.table)
_TABLE_NAME_RE = re.compile(r"^[a-zA-Z_][a-zA-Z0-9_]*$")


def validate_table_name(name: str) -> str:
    """Validate and return a safe table name.

    Raises ValueError if the name contains invalid characters.
    Only allows [a-zA-Z0-9_] with a letter or underscore start.
    """
    if not name or not _TABLE_NAME_RE.match(name):
        raise ValueError(
            f"Invalid table name: '{name}'. "
            "Only letters, digits, and underscores are allowed, "
            "and must start with a letter or underscore."
        )
    if len(name) > 128:
        raise ValueError(f"Table name too long: {len(name)} characters (max 128)")
    return name


def sanitize_error(exc: Exception) -> str:
    """Return a safe error message that doesn't leak internal details.

    - HTTPException and ValidationError: return original detail
    - All others: return generic message, log full error
    """
    from fastapi import HTTPException
    from pydantic import ValidationError

    if isinstance(exc, HTTPException):
        return str(exc.detail)
    if isinstance(exc, ValidationError):
        return str(exc)

    # Log full error for debugging
    logger.error(f"Internal error (sanitized): {type(exc).__name__}: {exc}")
    return "Internal server error"
