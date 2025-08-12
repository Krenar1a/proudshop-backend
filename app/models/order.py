from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.database import Base

class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    CANCELED = "CANCELED"
    PAID = "PAID"
    COMPLETED = "COMPLETED"

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(80), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    total_eur = Column(Numeric(10,2), default=0)
    total_lek = Column(Numeric(10,2), default=0)
    # Shipping contact and address
    shipping_name = Column(String(160), nullable=True)
    shipping_email = Column(String(190), nullable=True)
    shipping_phone = Column(String(50), nullable=True)
    shipping_address = Column(String(255), nullable=True)
    shipping_city = Column(String(120), nullable=True)
    shipping_zip = Column(String(30), nullable=True)
    shipping_country = Column(String(80), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    customer = relationship("Customer")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_eur = Column(Numeric(10,2), nullable=False)
    price_lek = Column(Numeric(10,2), nullable=False)

    order = relationship("Order", back_populates="items")
