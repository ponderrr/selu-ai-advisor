from sqlalchemy import Column, Integer, String, Enum
from enum import Enum as PythonEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
from .common import CommonModel
from app.utils.constant.globals import UserRole

class UserRole(PythonEnum):
    STUDENT = "student"
    ADVISOR = "advisor"
    ADMIN = "admin"

class User(Base): 
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True) 
    w_number = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    completed_courses = relationship("StudentCourse", back_populates="student")
    role = Column(Enum(UserRole), default=UserRole.STUDENT)    
    def __repr__(self):
        return f"{self.email}"
