from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate

def list_customers(db: Session):
    return db.query(Customer).order_by(Customer.id).all()

def create_customer(db: Session, payload: CustomerCreate) -> Customer:
    exists = db.query(Customer).filter(Customer.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email exists")
    cust = Customer(**payload.model_dump())
    db.add(cust)
    db.commit()
    db.refresh(cust)
    return cust
