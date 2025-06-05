from pydantic import BaseModel

class MajorOut(BaseModel):
    id: int
    name: str
    description: str | None = None

    model_config = {"orm_mode": True}

class ConcentrationOut(BaseModel):
    id: int
    major_id: int
    name: str
    description: str | None = None

    model_config = {"orm_mode": True}
