FROM python:3.13-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System deps (optional, keep slim)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Create data dirs for volumes
RUN mkdir -p /data/db /data/uploads

ENV CT_DB_PATH=/data/db/ct_travel.db \
    CT_UPLOAD_DIR=/data/uploads \
    CT_ALLOWED_ORIGINS="*"

EXPOSE 8000

CMD ["sh", "-c", "mkdir -p /data/db /data/uploads && uvicorn app.main:app --host 0.0.0.0 --port 8000"]

