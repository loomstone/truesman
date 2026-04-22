"""Retell AI webhook endpoints.

These endpoints are called by Retell during and after phone calls.
The function endpoints are called mid-conversation when the agent
needs to look up data (menu, hours, reservations, etc.).
The post-call endpoint is called after a call ends with the recording,
transcript, and metadata.
"""
from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import APIRouter, Request
from ..db import get_supabase

router = APIRouter(prefix="/retell", tags=["retell"])

# --- Helper: find the project for this agent ---

async def get_project_for_agent(agent_id: str) -> dict | None:
    sb = get_supabase()
    result = sb.table("projects").select("*").eq("retell_agent_id", agent_id).single().execute()
    return result.data if result.data else None

async def get_project_by_id(project_id: str) -> dict | None:
    sb = get_supabase()
    result = sb.table("projects").select("*").eq("id", project_id).single().execute()
    return result.data if result.data else None

# For now, since we only have one project, grab the first one
async def get_default_project() -> dict | None:
    sb = get_supabase()
    result = sb.table("projects").select("*").limit(1).execute()
    return result.data[0] if result.data else None


# ============================================================
# TOOL ENDPOINTS — called by Retell mid-conversation
# ============================================================

@router.post("/tools/get_business_hours")
async def tool_get_business_hours(request: Request) -> dict:
    body = await request.json()
    project = await get_default_project()
    if not project:
        return {"result": "Sorry, I could not find the business information right now."}

    sb = get_supabase()
    hours = sb.table("project_hours").select("*").eq(
        "project_id", project["id"]
    ).order("day_of_week").execute()

    if not hours.data:
        return {"result": "I don'tave hours information available right now."}

    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    lines = []
    for h in hours.data:
        day = day_names[h["day_of_week"]]
        if h["is_closed"]:
            lines.append(f"{day}: Closed")
        else:
            open_t = h["open_time"][:5] if h["open_time"] else "?"
            close_t = h["close_time"][:5] if h["close_time"] else "?"
            lines.append(f"{day}: {open_t} to {close_t}")

    return {"result": "Our hours are: " + ", ".join(lines)}


@router.post("/tools/get_menu")
async def tool_get_menu(request: Request) -> dict:
    body = await request.json()
    project = await get_default_project()
    if not project:
        return {"result": "Sorry, I could not find the menu right now."}

    sb = get_supabase()

    version = sb.table("menu_versions").select("id").eq(
        "project_id", project["id"]
    ).eq("is_active", True).single().execute()

    if not version.data:
        return {"result": "The menu is not available right now."}

    items = sb.table("project_menu_items").select("*").eq(
        "menu_version_id", version.data["id"]
    ).eq("available", True).order("category").order("name").execute()

    if not items.data:
        return {"result": "There are no menu items available right now."}

    lines = []
    current_cat = ""
    for item in items.data:
        if item["category"] != current_cat:
            current_cat = item["category"]
            lines.append(f"\n{current_cat}:")
        price = f"${item['price_cents'] / 100:.2f}"
        desc = f" - {item['description']}" if item.get("description") else ""
        lines.append(f"  {item['name']}: {price}{desc}")

    return {"result": "Here is our menu: " + " ".join(lines)}


@router.post("/tools/check_reservation_availability")
async def tool_check_availability(request: Request) -> dict:
    body = await request.json()
    args = body.get("args", {})
    date_str = args.get("date")
    party_size = args.get("party_size", 2)

    project = await get_default_project()
    if not project:
        return {"result": "Sorry, I cannot check availability right now."}

    sb = get_supabase()

    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d")
    except (ValueError, TypeError):
        return {"result": "I need a valid date. Could you tell me the date you would like?"}

    dow = target_date.weekday()

    hours = sb.table("project_hours").select("*").eq(
        "project_id", project["id"]
    ).eq("day_of_week", dow).single().execute()

    if not hours.data or hours.data["is_closed"]:
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        return {"result": f"Sorry, we are closed on {day_names[dow]}s."}

    rules = sb.table("project_reservation_rules").select("*").eq(
        "project_id", project["id"]
    ).single().execute()

    if not rules.data:
        return {"result": "Reservation rules are not configured yet."}

    r = rules.data
    if party_size < r["party_size_min"] or party_size > r["party_size_max"]:
        return {"result": f"We can accommodate parties between {r['party_size_min']} and {r['party_size_max']} guests."}

    open_time = datetime.strptime(hours.data["open_time"][:5], "%H:%M")
    close_time = datetime.strptime(hours.data["close_time"][:5], "%H:%M")
    buffer = timedelta(minutes=r["buffer_before_close_min"])
    last_slot = close_time - buffer
    slot_duration = timedelta(minutes=r["slot_duration_min"])

    existing = sb.table("reservations").select("start_time").eq(
        "project_id", project["id"]
    ).gte("start_time", target_date.isoformat()).lt(
        "start_time", (target_date + timedelta(days=1)).isoformat()
    ).execute()

    booked_times = set()
    for res in (existing.data or []):
        booked_times.add(res["start_time"][:16])

    available_slots = []
    current = open_time
    while current <= last_slot:
        slot_key = target_date.replace(hour=current.hour, minute=current.minute).strftime("%Y-%m-%dT%H:%M")
        count = sum(1 for b in booked_times if b == slot_key)
        if count < r["max_concurrent_per_slot"]:
            available_slots.append(current.strftime("%I:%M %p"))
        current += slot_duration

    if not available_slots:
        return {"result": f"Sorry, we don't have any available slots on {date_str}."}

    if len(available_slots) > 6:
        sample = available_slots[:3] + ["..."] + available_slots[-3:]
        return {"result": f"We have slots available on {date_str} including: {', '.join(sample)}. What time works best for you?"}

    return {"result": f"Available times on {date_str}: {', '.join(available_slots)}. Which time would you prefer?"}


@router.post("/tools/create_reservation")
async def tool_create_reservation(request: Request) -> dict:
    body = await request.json()
    args = body.get("args", {})

    customer_name = args.get("customer_name", "Guest")
    customer_phone = args.get("customer_phone", "")
    date_str = args.get("date")
    time_str = args.get("time")
    party_size = args.get("party_size", 2)
    notes = args.get("notes", "")

    project = await get_default_project()
    if not project:
        return {"result": "Sorry, I cannot book a reservation right now."}

    try:
        start_time = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    except (ValueError, TypeError):
        return {"result": "I need a valid date and time for the reservation."}

    sb = get_supabase()

    result = sb.table("reservations").insert({
        "project_id": project["id"],
        "customer_name": customer_name,
        "customer_phone": customer_phone,
        "party_size": party_size,
        "start_time": start_time.isoformat(),
        "notes": notes or None,
        "status": "confirmed",
        "source": "bot",
    }).execute()

    if result.data:
        formatted_time = start_time.strftime("%I:%M %p on %A, %B %d")
        return {"result": f"Your reservation is confirmed for {party_size} guests at {formatted_time} under the name {customer_name}."}
    else:
        return {"result": "Sorry, there was an error booking your reservation. Please try again."}


# ============================================================
# POST-CALL WEBHOOK — called by Retell after a call ends
# ============================================================

@router.post("/post-call")
async def post_call_webhook(request: Request) -> dict:
    body = await request.json()

    call_data = body.get("call", {})
    call_id = call_data.get("call_id")
    agent_id = call_data.get("agent_id")
    from_number = call_data.get("from_number")
    to_number = call_data.get("to_number")
    direction = call_data.get("direction", "inbound")
    start_timestamp = call_data.get("start_timestamp")
    end_timestamp = call_data.get("end_timestamp")
    recording_url = call_data.get("recording_url")
    transcript = call_data.get("transcript")
    call_status = call_data.get("call_status")
    disconnection_reason = call_data.get("disconnection_reason")

    duration_sec = None
  if start_timestamp and end_timestamp:
        duration_sec = int((end_timestamp - start_timestamp) / 1000)

    transcript_text = ""
    if transcript:
        for turn in transcript:
            role = turn.get("role", "unknown")
            content = turn.get("content", "")
            transcript_text += f"{role}: {content}\n"

    project = await get_default_project()
    project_id = project["id"] if project else None

    sb = get_supabase()
    sb.table("calls").insert({
        "project_id": project_id,
        "retell_call_id": call_id,
        "direction": "inbound" if direction == "inbound" else "outbound",
        "caller_phone": from_number,
        "started_at": datetime.fromtimestamp(start_timestamp / 1000).isoformat() if start_timestamp else None,
        "ended_at": datetime.fromtimestamp(end_timestamp / 1000).isoformat() if end_timestamp else None,
        "duration_sec": duration_sec,
        "outcome": "unknown",
        "recording_url": recording_url,
        "transcript_text": transcript_text,
        "error_code": disconnection_reason,
    }).execute()

    return {"status": "ok"}
