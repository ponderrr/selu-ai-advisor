from pydantic import BaseModel
from enum import Enum

class ContactMethod(str, Enum):
    EMAIL = "Email"
    PHONE = "Phone"
    TEXT  = "Text"
    ANY   = "Any"

class ContactInfoSchema(BaseModel):
    preferred_method: ContactMethod
    value: str

    model_config = {
        "orm_mode": True,
        "use_enum_values": True,
    }
