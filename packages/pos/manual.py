"""ManualAdapter — POS adapter whose 'POS' is our own Supabase tables.

Used for:
- Pilot customers before their real POS is integrated
- Onboarding mode for every new customer
- Testing and development
- Restaurants whose POS will never have an integration
- Fallback when a real POS is down
"""
from __future__ import annotations

from datetime import datetime

from supabase import Client

from .adapter import POSAdapter
from .types import (
    BusinessHours,
    Customer,
    MenuItem,
    Order,
    OrderItem,
    OrderType,
    Reservation,
    ReservationSlot,
)


class ManualAdapter(POSAdapter):
    def __init__(self, project_id: str, supabase: Client):
        self.project_id = project_id
        self.sb = supabase

    @property
    def provider_name(self) -> str:
        return "manual"

    async def get_business_hours(self) -> list[BusinessHours]:
        # Week 2: implement real query
        raise NotImplementedError("ManualAdapter.get_business_hours — Week 2")

    async def get_menu(self, category: str | None = None) -> list[MenuItem]:
        raise NotImplementedError("ManualAdapter.get_menu — Week 2")

    async def check_item_availability(self, item_name: str) -> bool:
        raise NotImplementedError("ManualAdapter.check_item_availability — Week 2")

    async def check_reservation_availability(
        self, date: datetime, party_size: int
    ) -> list[ReservationSlot]:
        raise NotImplementedError("ManualAdapter.check_reservation_availability — Week 2")

    async def create_reservation(
        self,
        customer_name: str,
        customer_phone: str,
        start_time: datetime,
        party_size: int,
        notes: str | None = None,
    ) -> Reservation:
        raise NotImplementedError("ManualAdapter.create_reservation — Week 2")

    async def create_order(
        self,
        customer_name: str,
        customer_phone: str,
        items: list[OrderItem],
        order_type: OrderType,
        pickup_time: datetime | None = None,
        delivery_address: str | None = None,
    ) -> Order:
        raise NotImplementedError("ManualAdapter.create_order — Week 3")

    async def lookup_customer(self, phone: str) -> Customer | None:
        raise NotImplementedError("ManualAdapter.lookup_customer — Week 2")

    async def create_or_update_customer(
        self,
        phone: str,
        name: str | None = None,
        email: str | None = None,
    ) -> Customer:
        raise NotImplementedError("ManualAdapter.create_or_update_customer — Week 2")

    async def health_check(self) -> dict:
        try:
            self.sb.table("project_hours").select("project_id").eq(
                "project_id", self.project_id
            ).limit(1).execute()
            return {"ok": True, "provider": "manual"}
        except Exception as e:
            return {"ok": False, "provider": "manual", "error": str(e)}