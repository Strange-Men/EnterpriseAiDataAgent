#!/usr/bin/env bash
# start-dev.sh — Start both backend and frontend dev servers
# Usage: bash scripts/start-dev.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Enterprise AI Data Agent — Dev Startup ==="
echo "Root: $ROOT_DIR"

# Check dependencies
if ! command -v python &> /dev/null; then
    echo "ERROR: python not found"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "ERROR: npm not found"
    exit 1
fi

# Start backend
echo ""
echo "[1/2] Starting backend on port 8000..."
cd "$ROOT_DIR"
python -m uvicorn backend.main:app --reload --port 8000 &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"

# Wait for backend to be ready
echo "  Waiting for backend to start..."
for i in $(seq 1 30); do
    if curl -s http://localhost:8000/api/status > /dev/null 2>&1; then
        echo "  Backend ready!"
        break
    fi
    sleep 1
done

# Start frontend
echo ""
echo "[2/2] Starting frontend on port 3000..."
cd "$ROOT_DIR/frontend-react"
npm run dev &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"

echo ""
echo "=== Dev servers started ==="
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Trap Ctrl+C
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

wait
