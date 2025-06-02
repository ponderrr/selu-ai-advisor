from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import date

class StudentCourseProgress(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="user.id")
    course_id: int = Field(foreign_key="course.id")
    grade: Optional[str] = None
    completed: bool = False
    completion_date: Optional[date] = None
