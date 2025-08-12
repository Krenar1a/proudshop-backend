from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.cart import CartItemIn, CartItemOut
from app.services import cart_service
from app.dependencies import get_current_admin

router = APIRouter(prefix="/cart", tags=["cart"])

@router.get("/", response_model=List[CartItemOut])
def get_cart(customer_id: int | None = None, db: Session = Depends(get_db)):
    return cart_service.get_cart(db, customer_id)

@router.post("/", response_model=CartItemOut)
def add_to_cart(payload: CartItemIn, customer_id: int | None = None, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return cart_service.add_to_cart(db, customer_id, payload)

@router.delete("/{item_id}")
def remove_item(item_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    item = cart_service.remove_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item)
    db.commit()
    return {"ok": True}
