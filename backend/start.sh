#!/bin/bash
# =========================================================
# ForTrace Backend - Railway Startup Script
# =========================================================

# Exit immediately if a command exits with a non-zero status
set -e

# Railway dynamically injects the $PORT environment variable.
# Fallback to 8000 if $PORT is not defined.
PORT="${PORT:-8000}"

echo "🚀 Launching ForTrace FastAPI Backend on 0.0.0.0:${PORT}..."

# Execute Uvicorn server in production mode
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT}"
