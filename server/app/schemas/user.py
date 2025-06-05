from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from app.utils.constant.globals import UserRole

class UserBase(BaseModel):
    w_number: str
    email: EmailStr

class UserCreate(UserBase):
    w_number: str = Field(..., pattern=r"(?i)^w\d{7}$", to_upper=True)
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    first_name: Optional[str]
    last_name: Optional[str]
    role: UserRole = UserRole.STUDENT

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[UserRole] = None

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str




