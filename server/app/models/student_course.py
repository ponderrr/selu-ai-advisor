from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class StudentCourse(Base):
    __tablename__ = "student_courses"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("users.w_number"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    grade = Column(String, nullable=True)
    completed = Column(Boolean, default=True)

    student = relationship("User", back_populates="completed_courses")
    course = relationship("Course", back_populates="completed_by")

