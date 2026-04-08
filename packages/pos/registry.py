"""POS adapter registry — the ONLY place that knows about specific POS types.

Every other piece of code calls `get_adapter_for_project` and works with
the abstract POSAdapter interface. Adding a new POS = one new adapter file
and one new branch below. Zero changes elsewhere.
"""
from __future__ import annotations

from typing import Any

from supabase import Client

from .adapter import POSAdapter
from .manual import ManualAdapter
from .square import SquareAdapter
from .types import POSType


def get_adapter_for_project(project: dict[str, Any], supabase: Client) -> POSAdapter:
    pos_type = project["pos_type"]
    project_id = project["id"]
    pos_config = project.get("pos_config") or {}

    if pos_type == POSType.MANUAL.value:
        return ManualAdapter(project_id=project_id, supabase=supabase)

    if pos_type == POSType.SQUARE.value:
        access_token = pos_config.get("access_token")
        location_id = pos_config.get("location_id")
        if not access_token or not location_id:
            raise ValueError(
                f"Project {project_id} has pos_type=square but missing "
                f"access_token or location_id in pos_config"
            )
        return SquareAdapter(
            project_id=project_id,
            access_token=access_token,
            location_id=location_id,
        )

    # Future adapters slot in here:
    # if pos_type == POSType.CLOVER.value:
    #     return CloverAdapter(...)
    # if pos_type == POSType.TOAST.value:
    #     return ToastAdapter(...)

    raise ValueError(f"Unsupported POS type: {pos_type}")