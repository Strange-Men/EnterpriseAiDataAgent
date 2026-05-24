"""Centralized application configuration.

All env vars are read here. Import from this module instead of calling os.getenv() directly.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ── Database ─────────────────────────────────────────────────────
DUCKDB_PATH: str = os.getenv("DUCKDB_PATH", "data/enterprise.duckdb")

# ── AI / LLM ─────────────────────────────────────────────────────
ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_BASE_URL: str | None = os.getenv("ANTHROPIC_BASE_URL") or None
DEFAULT_LLM_MODEL: str = os.getenv("DEFAULT_LLM_MODEL", "claude-sonnet-4-5-20250929")
DEFAULT_TEMPERATURE: float = float(os.getenv("DEFAULT_TEMPERATURE", "0.3"))

# ── App ──────────────────────────────────────────────────────────
API_VERSION: str = "0.5.0"
