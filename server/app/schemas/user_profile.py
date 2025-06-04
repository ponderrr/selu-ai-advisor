# app/schemas/user_profile.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
from enum import Enum as PythonEnum

class ContactMethod(PythonEnum):
    EMAIL = "Email"
    PHONE = "Phone"
    TEXT = "Text"
    ANY = "Any"

class ContactInfoSchema(BaseModel):
    phone_number: Optional[str] = Field(None)
    preferred_method: Optional[ContactMethod] = Field(None)
    emergency_name: Optional[str] = Field(None)
    emergency_phone: Optional[str] = Field(None)

class AcademicInfoSchema(BaseModel):
    major: str = Field(...)
    concentration: Optional[str] = Field(None)
    expected_graduation: Optional[str] = Field(None)
    standing: Optional[str] = Field(None)
    current_semester: Optional[str] = Field(None)
    campus: Optional[str] = Field(None)

class UserProfileDetailedResponse(BaseModel):
    id: int
    first_name: str = Field(..., alias="firstName")
    last_name: str = Field(..., alias="lastName")
    preferred_name: Optional[str] = Field(None, alias="preferredName")
    w_number: str = Field(..., alias="wNumber")
    email: str
    secondary_email: Optional[str] = Field(None, alias="secondaryEmail")
    avatar: Optional[str] = Field(None)

    academic: AcademicInfoSchema
    contact: ContactInfoSchema

    class Config:
        populate_by_name = True
        from_attributes = True