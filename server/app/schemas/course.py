from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field
from app.models.enums import CourseCategory, CourseLevel 

from app.models.course import CourseCategory 

class _CourseBase(BaseModel):
    code: str = Field(..., alias="course_code")
    title: str
    description: str | None = None
    credits: float
    level: CourseLevel
    category: CourseCategory

    model_config = {
        "orm_mode": True,
        "use_enum_values": True                
    }

class CourseCreate(_CourseBase):
    """All fields required"""
    pass

class CourseUpdate(BaseModel):
    """PATCH payload — only mutated fields"""
    title: Optional[str] = None
    description: Optional[str] = None
    credits: Optional[float] = None
    level: Optional[CourseLevel] = None
    category: Optional[CourseCategory] = None

    model_config = {
        "orm_mode": True,
        "use_enum_values": True
    }

class CourseRead(_CourseBase):
    id: int
    created_at: datetime
    updated_at: datetime
