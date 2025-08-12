from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey, Boolean
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

    category = relationship("Category")
