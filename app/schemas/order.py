from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
from datetime import datetime

class OrderStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"  # UK spelling used by UI
    CANCELED = "CANCELED"    # US spelling (alias for compatibility)
    PAID = "PAID"
    COMPLETED = "COMPLETED"

class OrderItemIn(BaseModel):
    product_id: int
    quantity: int

class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_eur: float
    price_lek: float
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    customer_id: Optional[int] = None
    items: List[OrderItemIn]
    # Shipping details (optional for now)
    shipping_name: Optional[str] = None
    shipping_email: Optional[str] = None
    shipping_phone: Optional[str] = None
    shipping_address: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_zip: Optional[str] = None
    shipping_country: Optional[str] = None

class OrderOut(BaseModel):
    id: int
    order_number: str
    customer_id: Optional[int]
    status: OrderStatus
    total_eur: float
    total_lek: float
    # Shipping details
    shipping_name: Optional[str] = None
    shipping_email: Optional[str] = None
    shipping_phone: Optional[str] = None
    shipping_address: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_zip: Optional[str] = None
    shipping_country: Optional[str] = None
    created_at: Optional[datetime] = None
    items: List[OrderItemOut]
    class Config:
        from_attributes = True
