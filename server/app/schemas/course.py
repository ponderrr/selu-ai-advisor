from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime

class CourseLevel(str, Enum):
    LEVEL_100 = "100"
    LEVEL_200 = "200"
    LEVEL_300 = "300"
    LEVEL_400 = "400"
    GRADUATE = "Graduate"

class CourseBase(BaseModel):
    code: str
    title: str
    credits: int
    level: CourseLevel

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    credits: Optional[int] = None
    level: Optional[CourseLevel] = None
