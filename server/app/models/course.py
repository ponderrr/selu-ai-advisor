from sqlalchemy import Column, Integer, String, Text, Float, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from sqlalchemy import DateTime, Enum, func

from enum import Enum as PythonEnum
from app.models.enums import CourseCategory, CourseLevel

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    course_code = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    credits = Column(Float, nullable=False)

    category = Column(
        Enum(
            CourseCategory,
            name="coursecategory",
            native_enum=True,
            create_constraint=False,
        ),
        nullable=False,
    )

    level = Column(
        Enum(CourseLevel, name="courselevel"),
        nullable=False,
        default=CourseLevel.LEVEL_100,
    )
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
    )

    prerequisites_for_this = relationship("Prerequisite", foreign_keys="Prerequisite.course_id", back_populates="course")
    is_prerequisite_for = relationship("Prerequisite", foreign_keys="Prerequisite.prerequisite_course_id", back_populates="prerequisite_course")

    completed_by = relationship("StudentCourse", back_populates="course")

    def __repr__(self):
        return f"<Course {self.course_code}: {self.title}>"