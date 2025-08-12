from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.customer import CustomerCreate, CustomerOut
from app.services import customer_service
from app.dependencies import get_current_admin

router = APIRouter(prefix="/customers", tags=["customers"])

@router.get("/", response_model=List[CustomerOut])
def list_customers(db: Session = Depends(get_db)):
    return customer_service.list_customers(db)

@router.post("/", response_model=CustomerOut)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return customer_service.create_customer(db, payload)
