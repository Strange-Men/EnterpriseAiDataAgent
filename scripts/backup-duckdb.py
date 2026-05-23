#!/usr/bin/env python3
"""backup-duckdb.py — Backup DuckDB database file.

Usage:
    python scripts/backup-duckdb.py              # backup to backups/
    python scripts/backup-duckdb.py --restore     # restore latest backup
    python scripts/backup-duckdb.py --list        # list backups
"""

import argparse
import shutil
import sys
from datetime import datetime
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
DB_PATH = ROOT_DIR / "data" / "enterprise.duckdb"
BACKUP_DIR = ROOT_DIR / "backups"


def ensure_backup_dir():
    BACKUP_DIR.mkdir(exist_ok=True)


def backup():
    if not DB_PATH.exists():
        print(f"ERROR: Database not found at {DB_PATH}")
        sys.exit(1)

    ensure_backup_dir()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = f"enterprise_{timestamp}.duckdb"
    backup_path = BACKUP_DIR / backup_name

    shutil.copy2(DB_PATH, backup_path)
    size_mb = backup_path.stat().st_size / (1024 * 1024)
    print(f"Backup created: {backup_path.name} ({size_mb:.1f} MB)")

    # Keep only last 10 backups
    backups = sorted(BACKUP_DIR.glob("enterprise_*.duckdb"))
    if len(backups) > 10:
        for old in backups[:-10]:
            old.unlink()
            print(f"  Removed old backup: {old.name}")


def restore():
    ensure_backup_dir()
    backups = sorted(BACKUP_DIR.glob("enterprise_*.duckdb"))
    if not backups:
        print("No backups found")
        sys.exit(1)

    latest = backups[-1]
    DB_PATH.parent.mkdir(exist_ok=True)
    shutil.copy2(latest, DB_PATH)
    size_mb = DB_PATH.stat().st_size / (1024 * 1024)
    print(f"Restored: {latest.name} -> {DB_PATH} ({size_mb:.1f} MB)")


def list_backups():
    ensure_backup_dir()
    backups = sorted(BACKUP_DIR.glob("enterprise_*.duckdb"))
    if not backups:
        print("No backups found")
        return

    print(f"{'Backup':<40} {'Size':>10} {'Date':<20}")
    print("-" * 72)
    for b in backups:
        size_mb = b.stat().st_size / (1024 * 1024)
        mtime = datetime.fromtimestamp(b.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S")
        print(f"{b.name:<40} {size_mb:>8.1f} MB {mtime:<20}")


def main():
    parser = argparse.ArgumentParser(description="DuckDB backup utility")
    parser.add_argument("--restore", action="store_true", help="Restore latest backup")
    parser.add_argument("--list", action="store_true", help="List backups")
    args = parser.parse_args()

    if args.restore:
        restore()
    elif args.list:
        list_backups()
    else:
        backup()


if __name__ == "__main__":
    main()
