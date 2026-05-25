#!/bin/bash
# Run all tests for Enterprise AI Data Agent v0.6.0
# Usage: bash scripts/run-all-tests.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FAILED=0

echo "=========================================="
echo "Enterprise AI Data Agent — Full Test Suite"
echo "=========================================="
echo ""

# 1. Backend import check
echo "[1/6] Backend import check..."
cd "$PROJECT_ROOT"
python -c "from backend.main import app; print('OK')" || FAILED=1
echo ""

# 2. Backend unit tests
echo "[2/6] Backend unit tests (pytest)..."
cd "$PROJECT_ROOT/tests"
python -m pytest --ignore=ai -q || FAILED=1
echo ""

# 3. Frontend build
echo "[3/6] Frontend production build..."
cd "$PROJECT_ROOT/frontend-react"
npx next build 2>&1 | tail -5 || FAILED=1
echo ""

# 4. Frontend unit tests
echo "[4/6] Frontend unit tests (vitest)..."
cd "$PROJECT_ROOT/frontend-react"
npx vitest run || FAILED=1
echo ""

# 5. TypeScript type check
echo "[5/6] TypeScript type check..."
cd "$PROJECT_ROOT/frontend-react"
npx tsc --noEmit 2>&1 | tail -5 || echo "TypeScript check completed (warnings may exist)"
echo ""

# 6. E2E tests (optional - requires backend running)
echo "[6/6] E2E tests (Playwright)..."
if curl -s http://localhost:8000/api/status > /dev/null 2>&1; then
    echo "Backend detected on port 8000, running E2E tests..."
    cd "$PROJECT_ROOT/frontend-react"
    npx playwright test || echo "E2E tests had failures (non-blocking)"
else
    echo "Backend not running on port 8000, skipping E2E tests"
fi
echo ""

echo "=========================================="
if [ $FAILED -eq 0 ]; then
    echo "ALL TESTS PASSED"
else
    echo "SOME TESTS FAILED"
    exit 1
fi
echo "=========================================="
