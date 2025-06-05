from pydantic import BaseModel, Field, validator
from typing import Optional

VALID_GRADES = {"A", "B", "C", "D", "F", "P"}

class StudentCourseBase(BaseModel):
    course_id: int = Field(..., gt=0)
    grade: Optional[str] = None
    completed: bool = False

    @validator("grade")
    def grade_must_be_valid(cls, v):
        if v is not None and v.upper() not in VALID_GRADES:
            raise ValueError(f"grade must be one of {', '.join(sorted(VALID_GRADES))}")
        return v.upper() if v else v

    class Config:
        orm_mode = True
        use_enum_values = True

class StudentCourseCreate(StudentCourseBase):
    pass

class StudentCourseRead(StudentCourseBase):
    id: int
    user_id: int
