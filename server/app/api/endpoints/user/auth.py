
from fastapi import APIRouter, Body, Depends, HTTPException, status
from typing import Annotated
from datetime import timedelta

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
from app.core.otp import set_otp, verify_otp
from app.models.user import User as UserModel

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

@auth_module.post("/verify-otp")
async def verify_otp_endpoint(
    email: str = Body(...),
    code: str = Body(...),
    db: Session = Depends(get_db),
):
    user = db.query(UserModel).filter_by(email=email).first()
    if not user:
        raise HTTPException(404, "User not found")

    if user.is_active:
        # Optional: skip verification and allow login
        return {"detail": "User already verified", "login": True}

    if not verify_otp(email, code):
        raise HTTPException(400, "Invalid or expired OTP")

    user.is_active = True
    db.commit()
    return {"detail": "OTP verified and account activated", "login": True}

@auth_module.post("/send-otp")
@auth_module.post("/resend-otp")
async def send_or_resend_otp(email: str = Body(..., embed=True)):
    try:
        set_otp(email)
        return {"detail": "OTP sent"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send OTP: {str(e)}"
        )