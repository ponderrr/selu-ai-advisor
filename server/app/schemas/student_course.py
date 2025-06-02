from pydantic import BaseModel
from typing import Optional

class StudentCourseBase(BaseModel):
    student_id: str
    course_id: int
    grade: Optional[str] = None
    completed: Optional[bool] = True

class StudentCourseCreate(StudentCourseBase):
    pass

class StudentCourse(StudentCourseBase):
    id: int

    class Config:
        orm_mode = True
