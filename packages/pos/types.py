"""Shared types for the POS adapter layer."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, time
from enum import Enum


class POSType(str, Enum):
    MANUAL = "manual"
    SQUARE = "square"
    CLOVER = "clover"
    TOAST = "toast"


class OrderType(str, Enum):
    PICKUP = "pickup"
    DELIVERY = "delivery"
    DINE_IN = "dine_in"


@dataclass
class BusinessHours:
    day_of_week: int  # 0 = Monday, 6 = Sunday
    open_time: time | None
    close_time: time | None
    is_closed: bool


@dataclass
class MenuItem:
    id: str
    name: str
    description: str | None
    price_cents: int
    category: str
    available: bool
    tags: list[str] = field(default_factory=list)


@dataclass
class ReservationSlot:
    start_time: datetime
    end_time: datetime
    party_size_max: int


@dataclass
class Reservation:
    id: str
    customer_name: str
    customer_phone: str
    party_size: int
    start_time: datetime
    notes: str | None = None
    pos_external_id: str | None = None


@dataclass
class OrderItem:
    menu_item_id: str
    name: str
    quantity: int
    price_cents: int
    modifications: list[str] = field(default_factory=list)


@dataclass
class Order:
    id: str
    customer_name: str
    customer_phone: str
    items: list[OrderItem]
    subtotal_cents: int
    tax_cents: int
    total_cents: int
    order_type: OrderType
    pickup_time: datetime | None = None
    delivery_address: str | None = None
    status: str = "pending"
    pos_external_id: str | None = None


@dataclass
class Customer:
    id: str
    name: str | None
    phone: str
    email: str | None = None
    tags: list[str] = field(default_factory=list)


class NotSupportedError(Exception):
    """Raised when a POS adapter does not support a requested capability."""


class POSError(Exception):
    """Raised when a POS operation fails for a real reason (network, auth, etc.)."""