from sqlalchemy import Column, Integer, String, Text, ForeignKey, Date, Enum, DateTime 
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from enum import Enum as PythonEnum

class ContactMethod(PythonEnum):
    EMAIL = "Email"
    PHONE = "Phone"
    TEXT = "Text"
    ANY = "Any"

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    bio = Column(Text, nullable=True)
    profile_picture_url = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    
    phone_number = Column(String(20), nullable=True)
    preferred_contact_method = Column(Enum(ContactMethod), default=ContactMethod.EMAIL, nullable=False)
    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)

    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(50), nullable=True)
    zip_code = Column(String(10), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="user_profile")

    def __repr__(self):
        return f"<UserProfile for User ID: {self.user_id}>"