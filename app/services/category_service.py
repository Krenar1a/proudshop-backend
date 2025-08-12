from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.category import Category
from app.schemas.category import CategoryCreate
from typing import List

def list_categories(db: Session) -> List[Category]:
    return db.query(Category).order_by(Category.id).all()

def create_category(db: Session, payload: CategoryCreate) -> Category:
    exists = db.query(Category).filter((Category.slug == payload.slug) | (Category.name == payload.name)).first()
    if exists:
        raise HTTPException(status_code=400, detail="Category already exists")
    cat = Category(**payload.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat
