"""Repository health checks for local artifacts and misplaced data files."""

from __future__ import annotations

from pathlib import Path
import subprocess


ROOT_DIR = Path(__file__).resolve().parents[1]

FORBIDDEN_PATHS = [
    ".env",
    ".coverage",
    ".pytest_cache",
    ".idea",
    "backend/data/enterprise.duckdb",
]

FORBIDDEN_DIR_NAMES = {"__pycache__"}


def main() -> int:
    issues: list[str] = []
    warnings: list[str] = []
    tracked_files = _tracked_files()

    for relative in FORBIDDEN_PATHS:
        path = ROOT_DIR / relative
        if path.exists():
            if _is_tracked(relative, tracked_files):
                issues.append(f"Forbidden artifact is tracked by git: {relative}")
            else:
                warnings.append(f"Local artifact is present but untracked: {relative}")

    for path in ROOT_DIR.rglob("*"):
        if ".git" in path.parts:
            continue
        if path.name in FORBIDDEN_DIR_NAMES:
            issues.append(f"Generated directory present: {path.relative_to(ROOT_DIR).as_posix()}")

    if issues:
        print("Repository health check failed:")
        for issue in issues:
            print(f"- {issue}")
        for warning in warnings:
            print(f"! {warning}")
        return 1

    for warning in warnings:
        print(f"Warning: {warning}")
    print("Repository health check passed.")
    return 0


def _tracked_files() -> set[str]:
    result = subprocess.run(
        ["git", "ls-files"],
        cwd=ROOT_DIR,
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return set()
    return {line.strip().replace("\\", "/") for line in result.stdout.splitlines() if line.strip()}


def _is_tracked(relative: str, tracked_files: set[str]) -> bool:
    normalized = relative.replace("\\", "/").rstrip("/")
    return normalized in tracked_files or any(item.startswith(f"{normalized}/") for item in tracked_files)


if __name__ == "__main__":
    raise SystemExit(main())
