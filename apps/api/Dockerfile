FROM python:3.13-slim

WORKDIR /app

COPY packages/pos /app/packages/pos
COPY apps/api /app/apps/api

RUN pip install uv
RUN cd /app/apps/api && uv sync

WORKDIR /app/apps/api

CMD ["uv", "run", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--app-dir", "src"]
