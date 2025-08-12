from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from passlib.context import CryptContext
from app.db.database import get_db
from app.schemas.admin import AdminCreate, AdminOut
from app.models.admin import Admin, AdminRole
from app.dependencies import get_current_admin

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/admins", tags=["admins"])

def ensure_super(admin: Admin):
    if admin.role != AdminRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Requires SUPER_ADMIN")

@router.get("/", response_model=List[AdminOut])
def list_admins(db: Session = Depends(get_db), current=Depends(get_current_admin)):
    ensure_super(current)
    return db.query(Admin).order_by(Admin.id).all()

@router.post("/", response_model=AdminOut)
def create_admin(payload: AdminCreate, db: Session = Depends(get_db), current=Depends(get_current_admin)):
    ensure_super(current)
    existing = db.query(Admin).filter(Admin.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    admin = Admin(email=payload.email, name=payload.name, role=payload.role, password_hash=pwd_context.hash(payload.password))
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin

@router.get("/{admin_id}", response_model=AdminOut)
def get_admin(admin_id: int, db: Session = Depends(get_db), current=Depends(get_current_admin)):
    ensure_super(current)
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin

@router.put("/{admin_id}", response_model=AdminOut)
def update_admin(admin_id: int, payload: AdminCreate, db: Session = Depends(get_db), current=Depends(get_current_admin)):
    # Only SUPER_ADMIN can update other admins
    ensure_super(current)
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    # email uniqueness
    if payload.email and payload.email != admin.email:
        exists = db.query(Admin).filter(Admin.email == payload.email).first()
        if exists:
            raise HTTPException(status_code=400, detail="Email in use")
        admin.email = payload.email
    if payload.name is not None:
        admin.name = payload.name
    if payload.role:
        admin.role = payload.role
    if payload.password:
        admin.password_hash = pwd_context.hash(payload.password)
    db.commit()
    db.refresh(admin)
    return admin

@router.delete("/{admin_id}")
def delete_admin(admin_id: int, db: Session = Depends(get_db), current=Depends(get_current_admin)):
    ensure_super(current)
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    # Prevent deleting the last SUPER_ADMIN in future if needed
    db.delete(admin)
    db.commit()
    return {"ok": True}
