from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base 


class Prerequisite(Base):
    __tablename__ = "prerequisites"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)
    prerequisite_course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)

    course = relationship(
        "Course", 
        foreign_keys=[course_id], 
        back_populates="prerequisites_for_this"
    )

    prerequisite_course = relationship(
        "Course", 
        foreign_keys=[prerequisite_course_id], 
        back_populates="is_prerequisite_for"
    )

    def __repr__(self):
        return (
            f"<Prerequisite(course_id={self.course_id}, "
            f"prerequisite_course_id={self.prerequisite_course_id})>"
        )