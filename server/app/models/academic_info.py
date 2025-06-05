from sqlalchemy import Column, Integer, String, ForeignKey, Date 
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base 
from app.models.major import Major   
from app.models.concentration import Concentration 

class AcademicInfo(Base):
    __tablename__ = "academic_infos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    major_id = Column(Integer, ForeignKey("majors.id"))
    concentration_id = Column(Integer, ForeignKey("concentrations.id"))
    
    expected_graduation_semester = Column(String, nullable=True)
    expected_graduation_year = Column(Integer, nullable=True)
    academic_standing = Column(String, nullable=True)
    current_semester = Column(String, nullable=True)
    campus = Column(String, nullable=True)

    enrollment_date = Column(Date, nullable=True)

    created_at = Column(Date, server_default=func.now())
    updated_at = Column(Date, onupdate=func.now())

    user = relationship("User", back_populates="academic_info")
    major = relationship("Major", back_populates="academic_infos")
    concentration = relationship("Concentration", back_populates="academic_infos")

    def __repr__(self):
        return f"<AcademicInfo for User ID: {self.user_id}>"