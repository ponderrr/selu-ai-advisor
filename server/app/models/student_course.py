from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class StudentCourse(Base):
    __tablename__ = "student_courses"

    id        = Column(Integer, primary_key=True, index=True)
    user_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)

    completed = Column(Boolean, default=False, nullable=False)
    grade     = Column(String, nullable=True)
    semester  = Column(String, nullable=True)
    year      = Column(Integer, nullable=True)

    student = relationship("User", back_populates="completed_courses")
    course  = relationship("Course", back_populates="completed_by")

    def __repr__(self) -> str:
        return f"<StudentCourse u:{self.user_id} c:{self.course_id} g:{self.grade}>"
