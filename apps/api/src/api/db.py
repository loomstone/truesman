"""Supabase client factory.

Uses the secret key on the backend so we bypass RLS for server-side operations.
The dashboard uses the publishable key which respects RLS.
"""
from __future__ import annotations

from functools import lru_cache

from supabase import Client, create_client

from .config import settings


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_secret_key)