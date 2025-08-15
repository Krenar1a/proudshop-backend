from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Any, Dict
from app.db.database import get_db
from app.schemas.product import ProductCreate, ProductOut
from pydantic import BaseModel
from app.services import product_service
from app.dependencies import get_current_admin

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/")
def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = None,
    category: int | None = None,
    sort: str | None = None,
    featured: bool | None = None,
    offers: bool | None = None,
    paginated: bool = Query(False),
    db: Session = Depends(get_db)) -> Any:
    items, total = product_service.list_products(db, page=page, limit=limit, search=search, category=category, sort=sort, featured=featured, offers=offers)
    if not paginated:
        return [ProductOut.model_validate(i) for i in items]
    pages = (total + limit - 1) // limit
    return {
        "products": [ProductOut.model_validate(i) for i in items],
        "pagination": {"page": page, "limit": limit, "total": total, "pages": pages}
    }

@router.post("/", response_model=ProductOut)
def create_product(payload: ProductCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return product_service.create_product(db, payload)

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    prod = product_service.get_product(db, product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Not found")
    return prod

@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, payload: ProductCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    prod = product_service.get_product(db, product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in payload.model_dump().items():
        setattr(prod, k, v)
    db.commit()
    db.refresh(prod)
    return prod

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    prod = product_service.get_product(db, product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(prod)
    db.commit()
    return {"ok": True}

class ProductFlagsIn(BaseModel):
    is_featured: bool | None = None
    is_offer: bool | None = None

@router.patch("/{product_id}/flags", response_model=ProductOut)
def update_flags(product_id: int, data: ProductFlagsIn, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    prod = product_service.get_product(db, product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Not found")
    changed = False
    if data.is_featured is not None and data.is_featured != prod.is_featured:
        prod.is_featured = data.is_featured
        changed = True
    if data.is_offer is not None and data.is_offer != prod.is_offer:
        prod.is_offer = data.is_offer
        changed = True
    if changed:
        db.commit()
        db.refresh(prod)
    return prod
