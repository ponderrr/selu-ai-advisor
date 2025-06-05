from sqlalchemy import Boolean, Column, Integer, String, Enum, DateTime, ForeignKey, text
from enum import Enum as PythonEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from .common import CommonModel
from app.utils.constant.globals import UserRole

from app.models.academic_info import AcademicInfo
from app.models.user_profile import UserProfile

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
    role = Column(Enum(UserRole), default=UserRole.STUDENT, nullable=False)

    completed_courses = relationship("StudentCourse", back_populates="student")
    chat_messages = relationship("ChatMessage", back_populates="user")
    
    current_degree_program_id = Column(Integer, ForeignKey("degree_programs.id"), nullable=True)
    expected_graduation_year = Column(Integer, nullable=True)
    advisor_id = Column(Integer, ForeignKey("users.id"), nullable=True) 
    
    preferred_name = Column(String, nullable=True)
    secondary_email = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user_profile = relationship("UserProfile", back_populates="user", uselist=False)
    academic_info = relationship("AcademicInfo", back_populates="user", uselist=False)

    current_degree_program = relationship("DegreeProgram", backref="enrolled_students", foreign_keys=[current_degree_program_id])
    advisor = relationship("User", remote_side=[id], backref="advisees", foreign_keys=[advisor_id])
    is_active = Column(
        Boolean,
        nullable=False,
        server_default=text("false"),   # every existing row becomes inactive
    )
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"