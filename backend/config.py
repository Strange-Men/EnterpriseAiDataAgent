"""Centralized application configuration.

All env vars are read here. Import from this module instead of calling os.getenv() directly.
"""

import os
import logging
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("enterprise_ai.config")

# ── Database ─────────────────────────────────────────────────────
DUCKDB_PATH: str = os.getenv("DUCKDB_PATH", "data/enterprise.duckdb")

# ── AI / LLM ─────────────────────────────────────────────────────
ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_BASE_URL: str | None = os.getenv("ANTHROPIC_BASE_URL") or None
DEFAULT_LLM_MODEL: str = os.getenv("DEFAULT_LLM_MODEL", "claude-sonnet-4-5-20250929")

# Temperature with validation
try:
    DEFAULT_TEMPERATURE: float = float(os.getenv("DEFAULT_TEMPERATURE", "0.3"))
except ValueError:
    logger.warning("Invalid DEFAULT_TEMPERATURE value, using default 0.3")
    DEFAULT_TEMPERATURE = 0.3

# ── App ──────────────────────────────────────────────────────────
_version_path = Path(__file__).parent.joinpath("VERSION")
API_VERSION: str = _version_path.read_text().strip() if _version_path.exists() else "unknown"

# Warn on missing API key (non-blocking for dev environments)
if not ANTHROPIC_API_KEY:
    logger.warning("ANTHROPIC_API_KEY not set — AI features will be unavailable")
