"""Centralized application configuration.

All env vars are read here. Import from this module instead of calling os.getenv() directly.
"""

import os
import logging
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("enterprise_ai.config")


class ConfigurationError(Exception):
    """Raised when a required configuration value is invalid."""


# ── Database ─────────────────────────────────────────────────────
DUCKDB_PATH: str = os.getenv("DUCKDB_PATH", "data/enterprise.duckdb")

if not DUCKDB_PATH or not DUCKDB_PATH.strip():
    raise ConfigurationError(
        "DUCKDB_PATH is empty. Set the DUCKDB_PATH environment variable or use the default 'data/enterprise.duckdb'."
    )

_duckdb_parent = Path(DUCKDB_PATH).parent
try:
    _duckdb_parent.mkdir(parents=True, exist_ok=True)
except OSError as e:
    raise ConfigurationError(
        f"DUCKDB_PATH parent directory '{_duckdb_parent}' cannot be created: {e}"
    )

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
API_KEY: str = os.getenv("API_KEY", "")

try:
    MAX_UPLOAD_BYTES: int = int(os.getenv("MAX_UPLOAD_BYTES", str(50 * 1024 * 1024)))
except ValueError:
    logger.warning("Invalid MAX_UPLOAD_BYTES value, using default 50MB")
    MAX_UPLOAD_BYTES = 50 * 1024 * 1024

try:
    RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", "600"))
except ValueError:
    logger.warning("Invalid RATE_LIMIT_REQUESTS value, using default 600")
    RATE_LIMIT_REQUESTS = 600

try:
    RATE_LIMIT_WINDOW_SECONDS: int = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))
except ValueError:
    logger.warning("Invalid RATE_LIMIT_WINDOW_SECONDS value, using default 60")
    RATE_LIMIT_WINDOW_SECONDS = 60

RATE_LIMIT_ENABLED: bool = os.getenv("RATE_LIMIT_ENABLED", "true").lower() not in ("false", "0", "no")

# Warn on missing API key (non-blocking for dev environments)
if not ANTHROPIC_API_KEY:
    logger.warning("ANTHROPIC_API_KEY not set — AI features will be unavailable")
