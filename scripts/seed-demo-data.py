#!/usr/bin/env python3
"""Seed demo data into DuckDB for first-time experience.

Idempotent: skips if demo_sales table already exists.
Usage: python scripts/seed-demo-data.py
"""

import os
import sys
import duckdb

# Paths
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(PROJECT_ROOT, "data", "enterprise.duckdb")
CSV_PATH = os.path.join(PROJECT_ROOT, "testExcel", "large_sales_data.csv")
TABLE_NAME = "demo_sales"


def seed_demo_data():
    """Load demo CSV into DuckDB if table doesn't exist."""
    if not os.path.exists(CSV_PATH):
        print(f"CSV not found: {CSV_PATH}")
        return False

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = duckdb.connect(DB_PATH)

    try:
        # Check if table exists
        tables = conn.execute(
            "SELECT table_name FROM information_schema.tables "
            "WHERE table_schema = 'main' AND table_name = ?",
            [TABLE_NAME]
        ).fetchall()

        if tables:
            print(f"Table '{TABLE_NAME}' already exists — skipping seed.")
            return False

        # Load CSV into demo_sales
        print(f"Seeding '{TABLE_NAME}' from {CSV_PATH}...")
        conn.execute(
            f"CREATE TABLE \"{TABLE_NAME}\" AS "
            f"SELECT * FROM read_csv_auto('{CSV_PATH}')"
        )

        row_count = conn.execute(f'SELECT COUNT(*) FROM "{TABLE_NAME}"').fetchone()[0]
        col_count = len(conn.execute(f'DESCRIBE "{TABLE_NAME}"').fetchall())
        print(f"Seeded '{TABLE_NAME}': {row_count} rows, {col_count} columns")
        return True

    finally:
        conn.close()


if __name__ == "__main__":
    result = seed_demo_data()
    sys.exit(0 if result is not None else 1)
