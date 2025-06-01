# app/schemas/progress.py
from pydantic import BaseModel
from datetime import date
from typing import Optional

class ProgressBase(BaseModel):
    course_id: int
    grade: Optional[str] = None
    completed: bool = False
    completion_date: Optional[date] = None

class ProgressResponse(BaseModel):
    w_number: str
    completed_hours: int
    total_required: int
    progress_percentage: float

    class Config:
        orm_mode = True


class ProgressCreate(BaseModel):
    course_id: int
    completed: bool = False
    grade: Optional[str] = None

class ProgressUpdate(BaseModel):
    completed: Optional[bool] = None
    grade: Optional[str] = None

class ProgressOut(ProgressBase):
    id: int
    student_id: int

    class Config:
        orm_mode = True
