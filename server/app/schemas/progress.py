# app/schemas/progress.py
from pydantic import BaseModel
from datetime import date
from typing import Optional, List

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

class CourseInfo(BaseModel):
    id: int
    name: str
    credits: float
    grade: Optional[str]
    completed: bool

class CategoryBreakdown(BaseModel):
    name: str
    required_credits: float
    completed_credits: float
    courses: List[CourseInfo]
    gpa: Optional[float]

class ProgressDetailedResponse(BaseModel):
    w_number: str
    student_name: str
    overall_gpa: Optional[float]
    total_required: float
    completed_hours: float
    progress_percentage: float
    categories: List[CategoryBreakdown]
