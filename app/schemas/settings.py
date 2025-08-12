from pydantic import BaseModel
from typing import Optional

class AdminSettingBase(BaseModel):
    key: str
    value: Optional[str] = None

class AdminSettingCreate(AdminSettingBase):
    pass

class AdminSettingOut(AdminSettingBase):
    id: int
    class Config:
        from_attributes = True
