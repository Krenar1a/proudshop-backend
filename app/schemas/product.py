from pydantic import BaseModel, field_serializer, computed_field
from typing import Optional
from datetime import datetime
import json

class ProductBase(BaseModel):
    title: str
    description: Optional[str] = None
    # Make price_eur optional at base level to tolerate legacy NULL rows
    price_eur: Optional[float] = None
    # Allow NULL in DB -> optional here
    price_lek: Optional[float] = None
    stock: int
    category_id: Optional[int] = None
    images: Optional[str] = None  # JSON string of image objects or URLs
    is_featured: bool = False
    is_offer: bool = False
    discount_price_eur: Optional[float] = None
    discount_price_lek: Optional[float] = None
    source_url: Optional[str] = None
    is_draft: bool = False
    slug: Optional[str] = None

class ProductCreate(ProductBase):
    # Keep price_eur required when creating new products (DB column non-null)
    price_eur: float

class ProductOut(ProductBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_serializer('created_at', 'updated_at')
    def serialize_dt(self, v: datetime | None):  # noqa: D401
        return v.isoformat() if v else None

    @computed_field  # type: ignore[misc]
    def primary_image(self) -> Optional[str]:
        try:
            if not self.images:
                return None
            data = json.loads(self.images)
            if not isinstance(data, list):
                return None
            return next((m.get('url') for m in data if isinstance(m, dict) and m.get('type') == 'image' and m.get('url')), None)
        except Exception:
            return None

    @computed_field  # type: ignore[misc]
    def primary_video(self) -> Optional[str]:
        try:
            if not self.images:
                return None
            data = json.loads(self.images)
            if not isinstance(data, list):
                return None
            return next((m.get('url') for m in data if isinstance(m, dict) and m.get('type', '').startswith('video') and m.get('url')), None)
        except Exception:
            return None
    class Config:
        from_attributes = True

class ProductFlagsUpdate(BaseModel):
    is_featured: Optional[bool] = None
    is_offer: Optional[bool] = None
    discount_price_eur: Optional[float] = None
    discount_price_lek: Optional[float] = None
    is_draft: Optional[bool] = None
