from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.order import OrderCreate, OrderOut, OrderStatus
from app.dependencies import get_current_admin
from app.models.order import Order
from app.services import order_service
from app.routers.emails import send_email_with_settings, _get_setting  # reuse existing mail logic
from jinja2 import Template
from pydantic import BaseModel

router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("/", response_model=List[OrderOut])
def list_orders(db: Session = Depends(get_db)):
    return order_service.list_orders(db)

@router.post("/", response_model=OrderOut)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    """Public order creation (guest checkout allowed)."""
    order = order_service.create_order(db, payload)
    # Fire-and-forget style (best-effort) email if shipping_email present
    if order.shipping_email:
        try:
            subject = f"Faleminderit për porosinë #{order.order_number}" if hasattr(order, 'order_number') else "Faleminderit për porosinë tuaj"
            tpl = Template("""
            <div style='font-family:Arial,sans-serif;font-size:14px;color:#222'>
              <h2>Faleminderit për porosinë tuaj!</h2>
              <p>Pershendetje {{name or 'Klient'}},</p>
              <p>Ne kemi pranuar porosinë tuaj me numër <strong>{{order_number}}</strong>.</p>
              <p>Totali: EUR {{total_eur}} / LEK {{total_lek}}</p>
              <p>Do t'ju njoftojmë sapo statusi të përditësohet.</p>
              <p style='margin-top:20px'>ProudShop</p>
            </div>
            """)
            html = tpl.render(name=order.shipping_name, order_number=order.order_number, total_eur=order.total_eur, total_lek=order.total_lek)
            send_email_with_settings(db, to=[order.shipping_email], subject=subject, html=html)
        except Exception:
            pass
    return order

@router.get("/by-number/{order_number}")
def get_order_by_number(order_number: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.order_number == order_number).first()
    if not order:
        return {"error": "Not found"}
    return order

@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Not found")
    return order

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

@router.put("/{order_id}/status", response_model=OrderOut)
def update_order_status(order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Not found")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    # Notify customer if email present
    if order.shipping_email:
        try:
            status_value = payload.status.value.upper()
            name = order.shipping_name or 'Klient'
            subjects = {
                'PROCESSING': f"Porosia #{order.order_number} është në proces",
                'SHIPPED': f"Porosia #{order.order_number} u nis",
                'DELIVERED': f"Porosia #{order.order_number} u dorëzua",
                'CANCELLED': f"Porosia #{order.order_number} u anulua",
                'CANCELED': f"Porosia #{order.order_number} u anulua",
                'CONFIRMED': f"Porosia #{order.order_number} u konfirmua",
                'PENDING': f"Porosia #{order.order_number} është në pritje",
                'PAID': f"Porosia #{order.order_number} u pagua",
                'COMPLETED': f"Porosia #{order.order_number} u përfundua"
            }
            body_messages = {
                'PROCESSING': 'Porosia juaj është marrë në proces dhe po përgatitet.',
                'SHIPPED': 'Porosia juaj është nisur dhe është në rrugë drejt jush.',
                'DELIVERED': 'Porosia juaj është dorëzuar. Shpresojmë të kënaqeni!',
                'CANCELLED': 'Porosia juaj është anuluar sipas kërkesës ose për shkak të një problemi.',
                'CANCELED': 'Porosia juaj është anuluar.',
                'CONFIRMED': 'Porosia juaj u konfirmua dhe do të vazhdojë përpunimin.',
                'PENDING': 'Porosia juaj është regjistruar dhe pret konfirmim.',
                'PAID': 'Pagesa u pranua. Faleminderit!',
                'COMPLETED': 'Porosia u përfundua me sukses. Faleminderit!'
            }
            subject = subjects.get(status_value, f"Përditësim i porosisë #{order.order_number}")
            message = body_messages.get(status_value, f"Statusi i porosisë suaj është: {status_value}.")
            html = f"""
            <div style='font-family:Arial,sans-serif;font-size:14px;color:#222'>
              <h2>Përditësim i Porosisë</h2>
              <p>Përshëndetje {name},</p>
              <p>{message}</p>
              <p><strong>Numri i porosisë:</strong> {order.order_number}</p>
              <p style='margin-top:15px'>ProudShop</p>
            </div>
            """
            send_email_with_settings(db, to=[order.shipping_email], subject=subject, html=html)
        except Exception:
            pass
    return order

@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(order)
    db.commit()
    return {"ok": True}
