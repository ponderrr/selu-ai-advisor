from datetime import date
from enum import Enum as PythonEnum
from typing import Optional

from pydantic import BaseModel, Field


class ContactMethod(str, PythonEnum):
    EMAIL = "Email"
    PHONE = "Phone"
    TEXT  = "Text"
    ANY   = "Any"


class ContactInfoSchema(BaseModel):
    phone_number: Optional[str] = None
    preferred_method: Optional[ContactMethod] = None
    emergency_name: Optional[str] = None
    emergency_phone: Optional[str] = None

    class Config:
        orm_mode = True
        use_enum_values = True          

class AcademicInfoSchema(BaseModel):
    major: str
    concentration: Optional[str] = None
    expected_graduation: Optional[str] = None
    standing: Optional[str] = None
    current_semester: Optional[str] = None
    campus: Optional[str] = None


class UserProfileDetailedResponse(BaseModel):
    id: int
    first_name: str = Field(..., alias="firstName")
    last_name: str = Field(..., alias="lastName")
    preferred_name: Optional[str] = Field(None, alias="preferredName")
    w_number: str = Field(..., alias="wNumber")
    email: str
    secondary_email: Optional[str] = Field(None, alias="secondaryEmail")
    avatar: Optional[str] = None

    academic: AcademicInfoSchema
    contact: ContactInfoSchema

    class Config:
        orm_mode = True
        populate_by_name = True
        use_enum_values = True
