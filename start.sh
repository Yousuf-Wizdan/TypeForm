#!/bin/bash
set -e

# Start FastAPI backend on internal port 8000
cd /app/backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 &

# Start Next.js frontend on Railway's $PORT (defaults to 3000)
cd /app/frontend
export HOSTNAME="0.0.0.0"
export PORT="${PORT:-3000}"
exec node server.js
