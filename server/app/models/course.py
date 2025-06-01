from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from .common import CommonModel

class Course(CommonModel):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    title = Column(String)
    credits = Column(Integer)
    level = Column(Enum("100", "200", "300", "400", "Graduate", name="course_levels"))

    completed_by = relationship("StudentCourse", back_populates="course")

