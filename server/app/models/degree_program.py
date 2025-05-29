from sqlalchemy import Column, Integer, String
from app.core.database import Base
from .common import CommonModel

class DegreeProgram(CommonModel):
    __tablename__ = "degree_programs"

    name = Column(String)
    concentration = Column(String, nullable=True)
    catalog_year = Column(Integer)
    total_hours = Column(Integer)