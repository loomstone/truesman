FROM python:3.13-slim

WORKDIR /app

COPY packages/pos /app/packages/pos
COPY apps/api /app/apps/api

RUN pip install uv

WORKDIR /app/apps/api
RUN uv sync

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--app-dir", "src"]
