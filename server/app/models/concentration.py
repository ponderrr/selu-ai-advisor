# app/models/concentration.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Concentration(Base):
    __tablename__ = "concentrations"

    id = Column(Integer, primary_key=True, index=True)
    major_id = Column(Integer, ForeignKey("majors.id"), nullable=False)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)

    academic_infos = relationship(
        "AcademicInfo",
        back_populates="concentration",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Concentration: {self.name}>"
