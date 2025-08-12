from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, asc, desc
from typing import Any, Dict
from app.db.database import get_db
from app.models.product import Product
from app.schemas.product import ProductOut

router = APIRouter(prefix="/search", tags=["search"])

@router.get("/")
def search_products(
    q: str | None = Query(None),
    category: int | None = None,
    minPrice: float | None = None,
    maxPrice: float | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort: str | None = None,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    query = db.query(Product)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(Product.title.ilike(like), Product.description.ilike(like)))
    if category:
        query = query.filter(Product.category_id == category)
    if minPrice is not None:
        query = query.filter(Product.price_eur >= minPrice)
    if maxPrice is not None:
        query = query.filter(Product.price_eur <= maxPrice)
    total = query.count()
    if sort == 'price_low':
        query = query.order_by(asc(Product.price_eur))
    elif sort == 'price_high':
        query = query.order_by(desc(Product.price_eur))
    elif sort == 'name':
        query = query.order_by(asc(Product.title))
    else:
        query = query.order_by(desc(Product.id))
    items = query.offset((page - 1) * limit).limit(limit).all()
    total_pages = (total + limit - 1) // limit
    return {
        "products": [ProductOut.model_validate(i) for i in items],
        "pagination": {
            "current": page,
            "total": total_pages,
            "count": total,
            "hasNext": page < total_pages,
            "hasPrev": page > 1
        },
        "filters": {
            "query": q,
            "category": category,
            "minPrice": minPrice,
            "maxPrice": maxPrice,
            "sort": sort
        }
    }
