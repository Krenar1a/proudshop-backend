from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.admin import Admin, RefreshToken
from app.dependencies import get_current_admin
from app.auth.security import verify_password, create_access_token, get_password_hash, generate_refresh_token, hash_token
from app.core.config import get_settings

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class TokenOutput(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

@router.post("/login", response_model=TokenOutput)
def login(data: LoginInput, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == data.email).first()
    if not admin or not verify_password(data.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    settings = get_settings()
    access = create_access_token(str(admin.id))
    raw_refresh = generate_refresh_token()
    refresh = RefreshToken(
        admin_id=admin.id,
        token_hash=hash_token(raw_refresh),
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(refresh)
    db.commit()
    return TokenOutput(access_token=access, refresh_token=raw_refresh)

class AdminCreateInput(BaseModel):
    email: EmailStr
    name: str | None = None
    password: str

@router.post("/register", response_model=TokenOutput)
def register(data: AdminCreateInput, db: Session = Depends(get_db)):
    exists = db.query(Admin).filter(Admin.email == data.email).first()
    if exists:
        # If already exists and password matches, treat as idempotent register -> issue tokens
        if verify_password(data.password, exists.password_hash):
            settings = get_settings()
            access = create_access_token(str(exists.id))
            raw_refresh = generate_refresh_token()
            refresh = RefreshToken(
                admin_id=exists.id,
                token_hash=hash_token(raw_refresh),
                expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
            )
            db.add(refresh)
            db.commit()
            return TokenOutput(access_token=access, refresh_token=raw_refresh)
        # If password doesn't match, keep previous behavior
        raise HTTPException(status_code=400, detail="Email in use")
    admin = Admin(email=data.email, name=data.name, password_hash=get_password_hash(data.password))
    db.add(admin)
    db.commit()
    db.refresh(admin)
    settings = get_settings()
    access = create_access_token(str(admin.id))
    raw_refresh = generate_refresh_token()
    refresh = RefreshToken(
        admin_id=admin.id,
        token_hash=hash_token(raw_refresh),
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(refresh)
    db.commit()
    return TokenOutput(access_token=access, refresh_token=raw_refresh)

class RefreshInput(BaseModel):
    refresh_token: str

@router.post("/refresh", response_model=TokenOutput)
def refresh(data: RefreshInput, db: Session = Depends(get_db)):
    token_h = hash_token(data.refresh_token)
    stored = db.query(RefreshToken).filter(RefreshToken.token_hash == token_h).first()
    if not stored or stored.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    access = create_access_token(str(stored.admin_id))
    # rotate refresh
    settings = get_settings()
    raw_refresh = generate_refresh_token()
    stored.token_hash = hash_token(raw_refresh)
    stored.expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db.commit()
    return TokenOutput(access_token=access, refresh_token=raw_refresh)

class LogoutInput(BaseModel):
    refresh_token: str

@router.post("/logout")
def logout(data: LogoutInput, db: Session = Depends(get_db)):
    token_h = hash_token(data.refresh_token)
    deleted = db.query(RefreshToken).filter(RefreshToken.token_hash == token_h).delete()
    db.commit()
    if not deleted:
        raise HTTPException(status_code=400, detail="Already logged out or invalid")
    return {"ok": True}

class AdminMeOut(BaseModel):
    id: int
    email: EmailStr
    name: str | None = None
    role: str

@router.get("/me", response_model=AdminMeOut)
def me(admin: Admin = Depends(get_current_admin)):
    return AdminMeOut(id=admin.id, email=admin.email, name=admin.name, role=admin.role.value)

class AdminProfileUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None

@router.put("/me", response_model=AdminMeOut)
def update_profile(data: AdminProfileUpdate, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    if data.email and data.email != admin.email:
        exists = db.query(Admin).filter(Admin.email == data.email).first()
        if exists:
            raise HTTPException(status_code=400, detail="Email në përdorim")
        admin.email = data.email
    if data.name is not None:
        admin.name = data.name.strip() or None
    db.commit()
    db.refresh(admin)
    return AdminMeOut(id=admin.id, email=admin.email, name=admin.name, role=admin.role.value)

class AdminPasswordChange(BaseModel):
    current_password: str
    new_password: str

@router.post("/me/change-password")
def change_password(data: AdminPasswordChange, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    if not verify_password(data.current_password, admin.password_hash):
        raise HTTPException(status_code=400, detail="Password aktual i pasaktë")
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password duhet të ketë min 6 karaktere")
    if verify_password(data.new_password, admin.password_hash):
        raise HTTPException(status_code=400, detail="Password i ri nuk mund të jetë i njëjtë")
    admin.password_hash = get_password_hash(data.new_password)
    db.commit()
    return {"ok": True}
