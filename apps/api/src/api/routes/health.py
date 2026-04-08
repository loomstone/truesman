"""Health check — verifies the API is running and can reach Supabase."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..db import get_supabase

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health() -> dict:
    return {"status": "ok", "service": "truesman-api"}


@router.get("/db")
async def health_db() -> dict:
    try:
        sb = get_supabase()
        sb.table("projects").select("id").limit(1).execute()
        return {"status": "ok", "supabase": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Supabase unreachable: {e}")