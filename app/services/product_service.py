from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.models.product import Product
from app.schemas.product import ProductCreate
from typing import List, Tuple

def list_products(db: Session,
                  page: int = 1,
                  limit: int = 20,
                  search: str | None = None,
                  category: int | None = None,
                  sort: str | None = None,
                  featured: bool | None = None,
                  offers: bool | None = None) -> Tuple[List[Product], int]:
    q = db.query(Product)
    if search:
        like = f"%{search}%"
        q = q.filter(or_(Product.title.ilike(like), Product.description.ilike(like)))
    if category:
        q = q.filter(Product.category_id == category)
    if featured is not None:
        if featured:
            q = q.filter(Product.is_featured == True)  # noqa: E712
        else:
            q = q.filter(Product.is_featured == False)  # noqa: E712
    if offers is not None:
        if offers:
            q = q.filter(Product.is_offer == True)  # noqa: E712
        else:
            q = q.filter(Product.is_offer == False)  # noqa: E712
    # Count without selecting additional columns that might not exist in older DBs
    total = q.order_by(None).count()
    # Sorting
    if sort == 'price_asc':
        q = q.order_by(asc(Product.price_eur))
    elif sort == 'price_desc':
        q = q.order_by(desc(Product.price_eur))
    elif sort == 'newest':
        q = q.order_by(desc(Product.id))
    else:
        q = q.order_by(asc(Product.title))
    items = q.offset((page - 1) * limit).limit(limit).all()
    return items, total

def create_product(db: Session, payload: ProductCreate) -> Product:
    prod = Product(**payload.model_dump())
    db.add(prod)
    db.commit()
    db.refresh(prod)
    return prod

def get_product(db: Session, product_id: int) -> Product | None:
    return db.query(Product).filter(Product.id == product_id).first()
