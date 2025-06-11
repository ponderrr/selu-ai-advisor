from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from app.models.user import UserRole, AcademicYear

class UserBase(BaseModel):
    w_number: str
    email: EmailStr

class UserCreate(UserBase):
    w_number: str = Field(..., pattern=r"(?i)^w\d{7}$", to_upper=True)
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    current_degree_program_id: Optional[int] = None
    academic_year: Optional[AcademicYear] = None
    preferred_name: Optional[str] = None
    secondary_email: Optional[EmailStr] = None
    expected_graduation_year: Optional[int] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    first_name: Optional[str]
    last_name: Optional[str]
    role: UserRole
    academic_year: Optional[AcademicYear]
    preferred_name: Optional[str]
    secondary_email: Optional[EmailStr]
    expected_graduation_year: Optional[int]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    current_degree_program_id: Optional[int] = None
    academic_year: Optional[AcademicYear] = None
    preferred_name: Optional[str] = None
    secondary_email: Optional[EmailStr] = None
    expected_graduation_year: Optional[int] = None
    role: Optional[UserRole] = None

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str