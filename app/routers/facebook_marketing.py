from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.db.database import get_db
from app.dependencies import get_current_admin
from app.models.admin import AdminSetting

router = APIRouter(prefix="/facebook", tags=["facebook"])

class CampaignIn(BaseModel):
    name: str
    objective: str | None = None
    budget_eur: float | None = None
    audience: str | None = None  # free text for now

class CampaignOut(CampaignIn):
    id: int

_MEM_CAMPAIGNS: list[dict] = []
_ID = 1

def _get_setting(db: Session, key: str) -> str | None:
    s = db.query(AdminSetting).filter(AdminSetting.key == key).first()
    return s.value if s else None

@router.get("/campaigns", response_model=List[CampaignOut])
def list_campaigns(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return _MEM_CAMPAIGNS[-100:]

@router.post("/campaigns", response_model=CampaignOut)
def create_campaign(data: CampaignIn, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    global _ID
    pixel = _get_setting(db, 'facebook_pixel_id')
    token = _get_setting(db, 'facebook_access_token')
    if not (pixel and token):
        raise HTTPException(status_code=400, detail="Facebook pixel/access token i mungon (vendosni në Settings)")
    rec = {**data.model_dump(), 'id': _ID}
    _ID += 1
    _MEM_CAMPAIGNS.append(rec)
    return rec
