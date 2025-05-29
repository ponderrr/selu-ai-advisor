from sqlalchemy import Column, Integer, ForeignKey, String
from app.core.database import Base
from .common import CommonModel

class Prerequisite(CommonModel):
    __tablename__ = "prerequisites"

    course_id = Column(Integer, ForeignKey("courses.id"), primary_key=True)
    prereq_course_id = Column(Integer, ForeignKey("courses.id"), primary_key=True)
    min_grade = Column(String)