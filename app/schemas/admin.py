from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class AdminRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    STAFF = "STAFF"

class AdminBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    role: AdminRole

class AdminCreate(AdminBase):
    password: str

class AdminOut(AdminBase):
    id: int
    class Config:
        from_attributes = True
