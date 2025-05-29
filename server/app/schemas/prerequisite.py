from pydantic import BaseModel
from datetime import datetime

class PrerequisiteBase(BaseModel):
    course_id: int
    prereq_course_id: int
    min_grade: str

class PrerequisiteCreate(PrerequisiteBase):
    pass

class Prerequisite(PrerequisiteBase):
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
