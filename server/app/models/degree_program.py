from sqlalchemy import Column, Integer, String, Text 
from sqlalchemy.orm import relationship
from app.core.database import Base 
from sqlalchemy.dialects.postgresql import JSONB 

class DegreeProgram(Base):
    __tablename__ = "degree_programs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    concentration = Column(String, nullable=True)
    catalog_year = Column(Integer, nullable=False)
    total_hours = Column(Integer, nullable=False)
    category_requirements = Column(JSONB, default={}, nullable=False) 
 

    def __repr__(self):
        return f"<DegreeProgram {self.name}>"