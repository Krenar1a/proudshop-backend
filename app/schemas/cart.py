from pydantic import BaseModel
from typing import Optional

class CartItemIn(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemOut(CartItemIn):
    id: int
    customer_id: Optional[int]
    class Config:
        from_attributes = True
