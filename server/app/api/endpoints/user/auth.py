# fastapi
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from datetime import timedelta
from pydantic import BaseModel, EmailStr

# sqlalchemy
from sqlalchemy.orm import Session

# import
from app.schemas.user import User, UserLogin, Token
from app.core.dependencies import get_db
from app.core.settings import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
from app.api.endpoints.user import functions as user_functions
from app.core.otp import set_otp, verify_otp  # In-memory OTP helpers

auth_module = APIRouter()

# ======= Traditional Login via Password =======

@auth_module.post("/login", response_model=Token)
async def login_for_access_token(
    user: UserLogin,
    db: Session = Depends(get_db)
) -> Token:
    if not user.email.endswith("@selu.edu"):
        raise HTTPException(status_code=400, detail="Only @selu.edu emails are allowed")
    member = user_functions.authenticate_user(db, user=user)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = user_functions.create_access_token(
        data={"id": member.id, "email": member.email, "role": member.role}, 
        expires_delta=access_token_expires
    )

    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = await user_functions.create_refresh_token(
        data={"id": member.id, "email": member.email, "role": member.role}, 
        expires_delta=refresh_token_expires
    )
    return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer")

@auth_module.post("/refresh", response_model=Token)
async def refresh_access_token(refresh_token: str, db: Session = Depends(get_db)):
    token = await user_functions.refresh_access_token(db, refresh_token)
    return token

@auth_module.get("/users/me/", response_model=User)
async def read_current_user(current_user: Annotated[User, Depends(user_functions.get_current_user)]):
    return current_user

# ======= OTP Login =======

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

@auth_module.post("/otp/request")
async def request_otp(data: OTPRequest):
    if not data.email.endswith("@selu.edu"):
      raise HTTPException(status_code=400, detail="Only @selu.edu emails are allowed")
    set_otp(data.email)
    return {"msg": "OTP sent (check logs in development)"}

@auth_module.post("/otp/verify", response_model=Token)
async def verify_otp_login(data: OTPVerify, db: Session = Depends(get_db)):
    if not data.email.endswith("@selu.edu"):
        raise HTTPException(status_code=400, detail="Only @selu.edu emails are allowed")
    if not verify_otp(data.email, data.otp):
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")

    user = user_functions.get_user_by_email(db, data.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    access_token = user_functions.create_access_token(
        data={"id": user.id, "email": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    refresh_token = await user_functions.create_refresh_token(
        data={"id": user.id, "email": user.email, "role": user.role},
        expires_delta=refresh_token_expires
    )

    return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer")
