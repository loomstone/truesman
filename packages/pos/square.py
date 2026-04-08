"""SquareAdapter — full Square for Restaurants integration.

Week 3-4: implement OAuth, menu sync, reservations (Bookings API),
orders with native ticket printing, customers.
"""
from __future__ import annotations

from datetime import datetime

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


class SquareAdapter(POSAdapter):
    def __init__(self, project_id: str, access_token: str, location_id: str):
        self.project_id = project_id
        self.access_token = access_token
        self.location_id = location_id

    @property
    def provider_name(self) -> str:
        return "square"

    async def get_business_hours(self) -> list[BusinessHours]:
        raise NotImplementedError("SquareAdapter.get_business_hours — Week 3")

    async def get_menu(self, category: str | None = None) -> list[MenuItem]:
        raise NotImplementedError("SquareAdapter.get_menu — Week 3")

    async def check_item_availability(self, item_name: str) -> bool:
        raise NotImplementedError("SquareAdapter.check_item_availability — Week 3")

    async def check_reservation_availability(
        self, date: datetime, party_size: int
    ) -> list[ReservationSlot]:
        raise NotImplementedError("SquareAdapter.check_reservation_availability — Week 3")

    async def create_reservation(
        self,
        customer_name: str,
        customer_phone: str,
        start_time: datetime,
        party_size: int,
        notes: str | None = None,
    ) -> Reservation:
        raise NotImplementedError("SquareAdapter.create_reservation — Week 3")

    async def create_order(
        self,
        customer_name: str,
        customer_phone: str,
        items: list[OrderItem],
        order_type: OrderType,
        pickup_time: datetime | None = None,
        delivery_address: str | None = None,
    ) -> Order:
        raise NotImplementedError("SquareAdapter.create_order — Week 4")

    async def lookup_customer(self, phone: str) -> Customer | None:
        raise NotImplementedError("SquareAdapter.lookup_customer — Week 3")

    async def create_or_update_customer(
        self,
        phone: str,
        name: str | None = None,
        email: str | None = None,
    ) -> Customer:
        raise NotImplementedError("SquareAdapter.create_or_update_customer — Week 3")

    async def health_check(self) -> dict:
        return {"ok": False, "provider": "square", "error": "Not implemented yet"}