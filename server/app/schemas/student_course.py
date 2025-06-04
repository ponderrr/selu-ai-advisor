from pydantic import BaseModel
from typing import Optional

class StudentCourseBase(BaseModel):
    course_id: int
    grade: Optional[str] = None
    completed: bool = False          

    model_config = {"orm_mode": True, "use_enum_values": True}

class StudentCourseCreate(StudentCourseBase):
    pass                           

class StudentCourseRead(StudentCourseBase):
    id: int
    user_id: int   