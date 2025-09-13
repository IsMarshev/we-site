#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
python3 -m venv .venv || true
source .venv/bin/activate
pip -q install -r requirements.txt
exec uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
