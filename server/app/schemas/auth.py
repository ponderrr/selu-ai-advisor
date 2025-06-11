# app/schemas/auth.py

from pydantic import BaseModel, EmailStr
from typing import Optional


# Removed SendOTPRequest as it's no longer used for login OTP
# class SendOTPRequest(BaseModel):
#     email: EmailStr


# Removed SendOTPResponse as it's no longer used for login OTP
# class SendOTPResponse(BaseModel):
#     msg: str


class AcademicInfo(BaseModel):
    status: Optional[str] = None
    expectedGraduation: Optional[str] = None
    classStanding: Optional[str] = None
    major: Optional[str] = None


class Agreements(BaseModel):
    termsOfService: bool = True
    codeOfConduct: bool = True
    ferpaConsent: bool = True


class RegisterRequest(BaseModel):
    email: EmailStr
    firstName: str
    lastName: str
    wNumber: Optional[str] = None
    academic: Optional[AcademicInfo] = None
    preferredName: Optional[str] = None
    agreements: Optional[Agreements] = None


class RegisterResponse(BaseModel):
    msg: str


class VerifyRegistrationRequest(BaseModel):
    email: EmailStr
    code: str


class VerifyRegistrationResponse(BaseModel):
    msg: str


class ResendRegistrationOTPRequest(BaseModel):
    email: EmailStr


class ResendRegistrationOTPResponse(BaseModel):
    msg: str