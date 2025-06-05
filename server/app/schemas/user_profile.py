from typing import Optional
from enum import Enum
from pydantic import BaseModel, Field

class ContactMethod(str, Enum):
    EMAIL = "Email"
    PHONE = "Phone"
    TEXT  = "Text"
    ANY   = "Any"

class AcademicBlock(BaseModel):
    major: str
    concentration: Optional[str] = None
    expected_graduation: Optional[str] = Field(None, alias="expectedGraduation")
    standing: Optional[str] = None
    current_semester: Optional[str] = Field(None, alias="currentSemester")
    campus: Optional[str] = None

    model_config = {"orm_mode": True, "populate_by_name": True, "use_enum_values": True}

class ContactBlock(BaseModel):
    phone_number: Optional[str] = Field(None, alias="phoneNumber")
    preferred_method: Optional[ContactMethod] = Field(None, alias="preferredMethod")
    emergency_name: Optional[str] = Field(None, alias="emergencyName")
    emergency_phone: Optional[str] = Field(None, alias="emergencyPhone")

    model_config = {"orm_mode": True, "populate_by_name": True, "use_enum_values": True}

class UserProfileDetailedResponse(BaseModel):
    id: int
    first_name: str = Field(..., alias="firstName")
    last_name: str = Field(..., alias="lastName")
    preferred_name: Optional[str] = Field(None, alias="preferredName")
    w_number: str = Field(..., alias="wNumber")
    email: str
    secondary_email: Optional[str] = Field(None, alias="secondaryEmail")
    avatar: Optional[str] = None
    academic: AcademicBlock
    contact: ContactBlock

    model_config = {"orm_mode": True, "populate_by_name": True, "use_enum_values": True}

