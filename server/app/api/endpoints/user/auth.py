# app/api/endpoints/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import random, string

from app.schemas.user import User, UserLogin, Token
from app.schemas.auth import (
    SendOTPRequest,
    SendOTPResponse,
    RegisterRequest,
    RegisterResponse,
    VerifyRegistrationRequest,
    VerifyRegistrationResponse,
    ResendRegistrationOTPRequest,
    ResendRegistrationOTPResponse,
)
from app.core.dependencies import get_db
from app.core.settings import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
from app.api.endpoints.user import functions as user_functions
from app.models.user import User as UserModel, UserRole
from app.models.notification_settings import NotificationSettings
from app.models.academic_info import AcademicInfo

auth_module = APIRouter()

_otp_store: dict[str, dict] = {}
_registration_store: dict[str, dict] = {}


def _generate_otp_code(length: int = 6) -> str:
    return "".join(random.choice(string.digits) for _ in range(length))


@auth_module.post("/login", response_model=Token)
async def login_for_access_token(user: UserLogin, db: Session = Depends(get_db)) -> Token:
    member = user_functions.authenticate_user(db, user=user)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = user_functions.create_access_token(
        data={"id": member.id, "email": member.email, "role": member.role.value},
        expires_delta=access_expires,
    )
    refresh_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = await user_functions.create_refresh_token(
        data={"id": member.id, "email": member.email, "role": member.role.value},
        expires_delta=refresh_expires,
    )
    return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer")


@auth_module.post("/refresh", response_model=Token)
async def refresh_access_token(refresh_token: str, db: Session = Depends(get_db)) -> Token:
    token = await user_functions.refresh_access_token(db, refresh_token)
    return token


@auth_module.get("/users/me/", response_model=User)
async def read_current_user(
    current_user: Annotated[UserModel, Depends(user_functions.get_current_user)]
) -> UserModel:
    return current_user


@auth_module.post("/register", response_model=RegisterResponse, status_code=status.HTTP_200_OK)
async def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> RegisterResponse:
    email = payload.email.lower().strip()
    
    existing_user = db.query(UserModel).filter(UserModel.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered."
        )
    
    if payload.wNumber:
        if db.query(UserModel).filter(UserModel.w_number == payload.wNumber).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="That Student ID (W‐number) is already registered.",
            )
    
    code = _generate_otp_code(6)
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    _otp_store[email] = {"code": code, "expires_at": expires_at}
    
    _registration_store[email] = {
        "email": email,
        "firstName": payload.firstName,
        "lastName": payload.lastName,
        "wNumber": payload.wNumber,
        "academic": payload.academic.dict() if payload.academic else None,
        "preferredName": payload.preferredName,
        "agreements": payload.agreements.dict() if payload.agreements else None,
    }
    
    print(f"[DEBUG] OTP for {email} = {code} (expires at {expires_at.isoformat()} UTC)")
    return RegisterResponse(msg="Registration initiated. Please check your email for verification code.")


@auth_module.post("/verify-registration", response_model=VerifyRegistrationResponse, status_code=status.HTTP_200_OK)
async def verify_registration(payload: VerifyRegistrationRequest, db: Session = Depends(get_db)) -> VerifyRegistrationResponse:
    email = payload.email.lower().strip()
    otp_code = payload.code
    
    otp_record = _otp_store.get(email)
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No OTP was requested for this email."
        )
    if datetime.utcnow() > otp_record["expires_at"]:
        del _otp_store[email]
        if email in _registration_store:
            del _registration_store[email]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="OTP has expired. Please request a new one."
        )
    if otp_code != otp_record["code"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP code."
        )
    
    registration_data = _registration_store.get(email)
    if not registration_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Registration data not found. Please start registration again."
        )
    
    if db.query(UserModel).filter(UserModel.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="That email is already in use."
        )
    
    new_user = UserModel(
        w_number=registration_data["wNumber"],
        email=email,
        password=None,  # No password required for now
        first_name=registration_data["firstName"],
        last_name=registration_data["lastName"],
        role=UserRole.STUDENT,
        preferred_name=registration_data.get("preferredName"),
        secondary_email=None,
        expected_graduation_year=None,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    default_notifs = NotificationSettings(
        user_id=new_user.id,
        email_advising_reminders=True,
        email_course_updates=True,
        email_deadline_alerts=True,
        email_system_updates=False,
        email_newsletter=False,
        push_advising_reminders=True,
        push_course_updates=True,
        push_deadline_alerts=True,
        push_system_updates=False,
        sms_advising_reminders=False,
        sms_urgent_deadlines=False,
        notification_frequency="daily",
        quiet_hours_enabled=False,
        quiet_hours_start="22:00",
        quiet_hours_end="08:00",
        timezone="America/Chicago",
    )
    db.add(default_notifs)
    db.commit()
    
    academic_data = registration_data.get("academic", {})
    academic = AcademicInfo(
        user_id=new_user.id,
        enrollment_date=None,
        major_id=None,
        concentration_id=None,
        expected_graduation_semester=academic_data.get("expectedGraduation"),
        expected_graduation_year=None,
        academic_standing=academic_data.get("classStanding"),
        current_semester=None,
        campus=None,
    )
    db.add(academic)
    db.commit()
    
    del _otp_store[email]
    del _registration_store[email]
    
    return VerifyRegistrationResponse(msg="Email verified successfully. Registration completed.")


@auth_module.post("/resend-registration-otp", response_model=ResendRegistrationOTPResponse, status_code=status.HTTP_200_OK)
async def resend_registration_otp(payload: ResendRegistrationOTPRequest, db: Session = Depends(get_db)) -> ResendRegistrationOTPResponse:
    email = payload.email.lower().strip()
    
    if email not in _registration_store:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No pending registration found for this email."
        )
    
    existing_user = db.query(UserModel).filter(UserModel.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered."
        )
    
    code = _generate_otp_code(6)
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    _otp_store[email] = {"code": code, "expires_at": expires_at}
    
    print(f"[DEBUG] Resent OTP for {email} = {code} (expires at {expires_at.isoformat()} UTC)")
    return ResendRegistrationOTPResponse(msg="New verification code sent to your email.")


@auth_module.post("/send-otp", response_model=SendOTPResponse, status_code=status.HTTP_200_OK)
async def send_otp(payload: SendOTPRequest, db: Session = Depends(get_db)) -> SendOTPResponse:
    email = payload.email.lower().strip()
    existing_user = db.query(UserModel).filter(UserModel.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered."
        )
    code = _generate_otp_code(6)
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    _otp_store[email] = {"code": code, "expires_at": expires_at}

    print(f"[DEBUG] OTP for {email} = {code} (expires at {expires_at.isoformat()} UTC)")
    return SendOTPResponse(msg="OTP generated. Check your email (or console for DEV).")