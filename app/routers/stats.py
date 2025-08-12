from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.dependencies import get_current_admin
from app.models.product import Product
from app.models.category import Category
from app.models.order import Order

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/")
def get_basic_stats(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    products = db.query(Product).count()
    categories = db.query(Category).count()
    orders = db.query(Order).count()
    recent_orders = db.query(Order).order_by(Order.id.desc()).limit(5).all()
    return {
        "counts": {"products": products, "categories": categories, "orders": orders},
        "recentOrders": [o.order_number for o in recent_orders]
    }

class CurrencyRatesOut(BaseModel):
    base: str
    rates: dict[str, float]

@router.get("/currency", response_model=CurrencyRatesOut)
def get_currency_rates(admin=Depends(get_current_admin)):
    # Static mock for now; replace with external API later
    return CurrencyRatesOut(base="EUR", rates={"EUR":1, "USD":1.08, "ALL":102.5})
