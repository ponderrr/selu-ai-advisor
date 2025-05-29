from sqlalchemy import Column, String, Integer
from app.core.database import Base
from .common import CommonModel

class Student(CommonModel):
    __tablename__ = "students"

    w_number = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True)
    entry_year = Column(Integer)
    total_hours = Column(Integer)