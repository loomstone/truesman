"""Abstract POS adapter interface.

Every POS integration implements this interface. The bot's tool handlers
only ever talk to this interface, never to a specific POS implementation.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime

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


class POSAdapter(ABC):
    """Contract every POS integration must implement."""

    @property
    @abstractmethod
    def provider_name(self) -> str: ...

    # ---- Hours ----
    @abstractmethod
    async def get_business_hours(self) -> list[BusinessHours]: ...

    # ---- Menu ----
    @abstractmethod
    async def get_menu(self, category: str | None = None) -> list[MenuItem]: ...

    @abstractmethod
    async def check_item_availability(self, item_name: str) -> bool: ...

    # ---- Reservations ----
    @abstractmethod
    async def check_reservation_availability(
        self, date: datetime, party_size: int
    ) -> list[ReservationSlot]: ...

    @abstractmethod
    async def create_reservation(
        self,
        customer_name: str,
        customer_phone: str,
        start_time: datetime,
        party_size: int,
        notes: str | None = None,
    ) -> Reservation: ...

    # ---- Orders ----
    @abstractmethod
    async def create_order(
        self,
        customer_name: str,
        customer_phone: str,
        items: list[OrderItem],
        order_type: OrderType,
        pickup_time: datetime | None = None,
        delivery_address: str | None = None,
    ) -> Order: ...

    # ---- Customers ----
    @abstractmethod
    async def lookup_customer(self, phone: str) -> Customer | None: ...

    @abstractmethod
    async def create_or_update_customer(
        self,
        phone: str,
        name: str | None = None,
        email: str | None = None,
    ) -> Customer: ...

    # ---- Health ----
    @abstractmethod
    async def health_check(self) -> dict: ...