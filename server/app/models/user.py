from enum import Enum as PyEnum
from sqlalchemy import (
    Boolean, Column, Integer, String, Enum, DateTime, ForeignKey, text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.notification_settings import NotificationSettings
from app.core.database import Base

class UserRole(PyEnum):
    STUDENT = "student"
    ADVISOR = "advisor"
    ADMIN   = "admin"

class AcademicYear(PyEnum):
    FRESHMAN  = "freshman"
    SOPHOMORE = "sophomore"
    JUNIOR    = "junior"
    SENIOR    = "senior"
    GRADUATE  = "graduate"
    OTHER     = "other"

class User(Base):
    __tablename__ = "users"

    id        = Column(Integer, primary_key=True, index=True)
    w_number  = Column(String, unique=True, nullable=False)
    email     = Column(String, unique=True, index=True, nullable=False)
    password  = Column(String, nullable=True)
    first_name = Column(String)
    last_name  = Column(String)
    role       = Column(Enum(UserRole), nullable=False, default=UserRole.STUDENT)
    academic_year = Column(Enum(AcademicYear), nullable=True)

    # Relationships
    completed_courses     = relationship("StudentCourse", back_populates="student")
    chat_messages         = relationship("ChatMessage", back_populates="user")

    user_profile          = relationship("UserProfile", back_populates="user",
                                          uselist=False, cascade="all, delete-orphan")
    academic_info         = relationship("AcademicInfo", back_populates="user",
                                          uselist=False, cascade="all, delete-orphan")

    current_degree_program_id = Column(Integer, ForeignKey("degree_programs.id"))
    current_degree_program    = relationship("DegreeProgram",
                                             backref="enrolled_students",
                                             foreign_keys=[current_degree_program_id])

    advisor_id  = Column(Integer, ForeignKey("users.id"))
    advisor     = relationship("User", remote_side=[id],
                               backref="advisees", foreign_keys=[advisor_id])

    preferred_name         = Column(String)
    secondary_email        = Column(String)
    expected_graduation_year = Column(Integer)

    is_active  = Column(Boolean, server_default=text("false"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(),
                        onupdate=func.now(), nullable=False)

    notification_settings = relationship("NotificationSettings", back_populates="user", uselist=False)
