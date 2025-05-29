from sqlalchemy import Column, Integer, String, Enum
from app.core.database import Base
from .common import CommonModel

class Course(CommonModel):
    __tablename__ = "courses"

    code = Column(String, unique=True, index=True)
    title = Column(String)
    credits = Column(Integer)
    level = Column(Enum("100", "200", "300", "400", "Graduate", name="course_levels"))
