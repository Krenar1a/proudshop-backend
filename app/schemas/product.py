from pydantic import BaseModel
from typing import Optional

class ProductBase(BaseModel):
    title: str
    description: Optional[str] = None
    price_eur: float
    price_lek: float
    stock: int
    category_id: Optional[int] = None
    images: Optional[str] = None  # JSON string of image objects or URLs
    is_featured: bool = False
    is_offer: bool = False
    discount_price_eur: Optional[float] = None
    discount_price_lek: Optional[float] = None
    source_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    class Config:
        from_attributes = True
