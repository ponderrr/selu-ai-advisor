from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class StudentBase(BaseModel):
    w_number: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    entry_year: Optional[int] = None
    total_hours: Optional[int] = None

class StudentCreate(StudentBase):
    pass

class Student(StudentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    entry_year: Optional[int] = None
    total_hours: Optional[int] = None
