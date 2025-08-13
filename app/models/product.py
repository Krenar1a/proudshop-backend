from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey, Boolean, DateTime
from datetime import datetime
from sqlalchemy.orm import relationship
from app.db.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(220), nullable=False)
    description = Column(Text)
    price_eur = Column(Numeric(10,2))
    price_lek = Column(Numeric(10,2))
    stock = Column(Integer, default=0)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    # JSON string (array of objects or URLs) to keep images for simplicity
    images = Column(Text, nullable=True)
    # New merchandising fields
    is_featured = Column(Boolean, nullable=False, default=False)
    is_offer = Column(Boolean, nullable=False, default=False)
    discount_price_eur = Column(Numeric(10,2), nullable=True)
    discount_price_lek = Column(Numeric(10,2), nullable=True)
    source_url = Column(Text, nullable=True)
    # Draft / publishing state
    is_draft = Column(Boolean, nullable=False, default=False)
    # Slug for SEO (nullable for backward compatibility with existing rows; populated via migration)
    slug = Column(String(220), nullable=True, index=True)
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    category = relationship("Category")
