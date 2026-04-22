"""Truesman API — FastAPI application entry point."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routes import health, retell

app = FastAPI(
    title="Truesman API",
    version="0.1.0",
    description="Voicebot platform backend",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(retell.router, prefix="/api")


@app.get("/")
async def root() -> dict:
    return {
        "service": "truesman-api",
        "environment": settings.environment,
        "docs": "/docs",
    }