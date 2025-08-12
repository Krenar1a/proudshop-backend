from sqlalchemy.orm import Session
from app.models.cart import CartItem
from app.schemas.cart import CartItemIn

def get_cart(db: Session, customer_id: int | None):
    q = db.query(CartItem)
    if customer_id:
        q = q.filter(CartItem.customer_id == customer_id)
    return q.order_by(CartItem.id).all()

def add_to_cart(db: Session, customer_id: int | None, payload: CartItemIn):
    existing = db.query(CartItem).filter(CartItem.customer_id == customer_id, CartItem.product_id == payload.product_id).first()
    if existing:
        existing.quantity += payload.quantity
        db.commit()
        db.refresh(existing)
        return existing
    item = CartItem(customer_id=customer_id, product_id=payload.product_id, quantity=payload.quantity)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

def remove_item(db: Session, item_id: int):
    item = db.query(CartItem).filter(CartItem.id == item_id).first()
    return item
