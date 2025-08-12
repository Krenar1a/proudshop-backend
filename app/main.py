from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.routers import auth, categories, products
from app.routers import search
from app.routers import customers, orders, cart
from app.routers import admins, stats
from app.routers import emails, chat, product_ai, facebook_marketing
from fastapi import Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.dependencies import get_current_admin
from app.models.admin import AdminSetting
from app.schemas.settings import AdminSettingCreate, AdminSettingOut
from typing import List
from fastapi import HTTPException
from app.models.admin import AdminSetting

settings = get_settings()

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(categories.router, prefix=settings.API_V1_PREFIX)
app.include_router(products.router, prefix=settings.API_V1_PREFIX)
app.include_router(customers.router, prefix=settings.API_V1_PREFIX)
app.include_router(orders.router, prefix=settings.API_V1_PREFIX)
app.include_router(cart.router, prefix=settings.API_V1_PREFIX)
app.include_router(search.router, prefix=settings.API_V1_PREFIX)
app.include_router(admins.router, prefix=settings.API_V1_PREFIX)
app.include_router(stats.router, prefix=settings.API_V1_PREFIX)
app.include_router(emails.router, prefix=settings.API_V1_PREFIX)
app.include_router(chat.router, prefix=settings.API_V1_PREFIX)
app.include_router(product_ai.router, prefix=settings.API_V1_PREFIX)
app.include_router(facebook_marketing.router, prefix=settings.API_V1_PREFIX)

@app.get(f"{settings.API_V1_PREFIX}/settings/", response_model=List[AdminSettingOut])
def list_settings(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return db.query(AdminSetting).order_by(AdminSetting.id).all()

@app.post(f"{settings.API_V1_PREFIX}/settings/", response_model=AdminSettingOut)
def upsert_setting(payload: AdminSettingCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    setting = db.query(AdminSetting).filter(AdminSetting.key == payload.key).first()
    if setting:
        setting.value = payload.value
    else:
        setting = AdminSetting(key=payload.key, value=payload.value)
        db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting

OPENAI_KEY_NAME = "OPENAI_API_KEY"

@app.get(f"{settings.API_V1_PREFIX}/openai/key")
def get_openai_key(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    s = db.query(AdminSetting).filter(AdminSetting.key == OPENAI_KEY_NAME).first()
    return {"exists": bool(s and s.value), "masked": bool(s and s.value), "last4": (s.value[-4:] if s and s.value and len(s.value) >=4 else None)}

class OpenAIKeyIn(AdminSettingCreate):
    pass

@app.post(f"{settings.API_V1_PREFIX}/openai/key")
def set_openai_key(payload: OpenAIKeyIn, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    if payload.key != OPENAI_KEY_NAME:
        raise HTTPException(status_code=400, detail="Key name must be OPENAI_API_KEY")
    setting = db.query(AdminSetting).filter(AdminSetting.key == OPENAI_KEY_NAME).first()
    if setting:
        setting.value = payload.value
    else:
        setting = AdminSetting(key=OPENAI_KEY_NAME, value=payload.value)
        db.add(setting)
    db.commit()
    return {"ok": True}

@app.get("/")
async def root():
    return {"message": "ProudShop API OK"}
