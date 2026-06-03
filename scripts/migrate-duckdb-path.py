"""Move misplaced DuckDB files out of backend/data without deleting data."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path
import shutil


ROOT_DIR = Path(__file__).resolve().parents[1]
SOURCE = ROOT_DIR / "backend" / "data" / "enterprise.duckdb"
TARGET = ROOT_DIR / "data" / "enterprise.duckdb"
LEGACY_DIR = ROOT_DIR / "data" / "legacy"


def main() -> int:
    if not SOURCE.exists():
        print("No misplaced backend/data/enterprise.duckdb found.")
        return 0

    LEGACY_DIR.mkdir(parents=True, exist_ok=True)

    if TARGET.exists():
        stamped = datetime.now().strftime("%Y%m%d-%H%M%S")
        archive = LEGACY_DIR / f"backend-enterprise-{stamped}.duckdb"
        shutil.move(str(SOURCE), str(archive))
        print(f"Moved misplaced database to legacy archive: {archive}")
        print("Canonical database already exists at data/enterprise.duckdb.")
        return 0

    shutil.move(str(SOURCE), str(TARGET))
    print("Moved backend/data/enterprise.duckdb to data/enterprise.duckdb.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
