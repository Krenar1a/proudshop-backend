#!/usr/bin/env bash
set -euo pipefail

# Activate venv if exists
if [ -d ".venv" ]; then
  source .venv/bin/activate
fi

alembic upgrade head || echo "[WARN] Alembic failed (maybe no migrations). Continuing..."
# Use uvicorn via gunicorn for managed workers
exec gunicorn app.main:app \
  --worker-class uvicorn.workers.UvicornWorker \
  --workers ${WORKERS:-2} \
  --bind 0.0.0.0:${PORT:-8000} \
  --timeout 120 \
  --graceful-timeout 30 \
  --log-level info
