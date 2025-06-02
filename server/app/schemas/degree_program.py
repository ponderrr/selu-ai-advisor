from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DegreeProgramBase(BaseModel):
    name: str
    concentration: Optional[str] = None
    catalog_year: int
    total_hours: int

class DegreeProgramCreate(DegreeProgramBase):
    pass

class DegreeProgram(DegreeProgramBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DegreeProgramUpdate(BaseModel):
    name: Optional[str] = None
    concentration: Optional[str] = None
    catalog_year: Optional[int] = None
    total_hours: Optional[int] = None
