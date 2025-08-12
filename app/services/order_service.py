from sqlalchemy.orm import Session
from fastapi import HTTPException
from uuid import uuid4
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate

def list_orders(db: Session):
    return db.query(Order).order_by(Order.id.desc()).all()

def create_order(db: Session, payload: OrderCreate) -> Order:
    if not payload.items:
        raise HTTPException(status_code=400, detail="No items")
    product_ids = [i.product_id for i in payload.items]
    products = {p.id: p for p in db.query(Product).filter(Product.id.in_(product_ids)).all()}
    if len(products) != len(set(product_ids)):
        raise HTTPException(status_code=400, detail="Invalid product")

    order = Order(
        order_number=str(uuid4())[:12],
        customer_id=payload.customer_id,
        shipping_name=payload.shipping_name,
        shipping_email=payload.shipping_email,
        shipping_phone=payload.shipping_phone,
        shipping_address=payload.shipping_address,
        shipping_city=payload.shipping_city,
        shipping_zip=payload.shipping_zip,
        shipping_country=payload.shipping_country,
    )
    total_eur = 0.0
    total_lek = 0.0
    db.add(order)
    db.flush()
    for item in payload.items:
        prod = products[item.product_id]
        # Basic stock check
        if prod.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product {prod.id}")
        line_eur = float(prod.price_eur) * item.quantity
        line_lek = float(prod.price_lek) * item.quantity
        total_eur += line_eur
        total_lek += line_lek
        order_item = OrderItem(order_id=order.id, product_id=prod.id, quantity=item.quantity, price_eur=prod.price_eur, price_lek=prod.price_lek)
        db.add(order_item)
        # Decrement stock
        prod.stock = prod.stock - item.quantity
    order.total_eur = total_eur
    order.total_lek = total_lek
    db.commit()
    db.refresh(order)
    return order
