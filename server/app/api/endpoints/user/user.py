from datetime import datetime
import re
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_user, get_password_hash
from app.models.user import User as UserModel, UserRole
from app.schemas.user import User, UserCreate, UserUpdate
from app.schemas.user_profile import UserProfileDetailedResponse
from app.services.user_profile_service import build_profile
from app.api.endpoints.user import functions as user_functions

import logging

from app.core.otp import set_otp, verify_otp
from app.schemas.otp import OTPVerifyRequest

logger = logging.getLogger(__name__)

user_module = APIRouter(prefix="/users", tags=["users"])

@user_module.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
def create_new_user(payload: UserCreate, db: Session = Depends(get_db)):
    if not payload.email.endswith("@selu.edu"):
        raise HTTPException(400, "Only @selu.edu email addresses are allowed")

    if user_functions.get_user_by_email(db, payload.email):
        raise HTTPException(409, "User already exists")

    w_num = payload.w_number.upper()
    if not re.fullmatch(r"^W\d{7}$", w_num):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="w_number must be 'W' followed by exactly 7 digits (e.g. W0666692)",
        )
    if db.query(UserModel).filter(UserModel.w_number == w_num).first():
        raise HTTPException(409, "W-number already exists")

    user = UserModel(
        w_number=w_num,
        email=payload.email,
        password=get_password_hash(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        is_active=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    set_otp(user.email)
    return user

@user_module.post("/verify-otp", status_code=204)
def verify_otp_endpoint(
    payload: OTPVerifyRequest, 
    db: Session = Depends(get_db)
):
    user = db.get(UserModel, payload.user_id)
    if user is None:
        raise HTTPException(404, "User not found")
    if user.is_active:
        raise HTTPException(400, "User already verified")

    if not verify_otp(user.email, str(payload.code).zfill(6)):
        raise HTTPException(400, "Invalid or expired code")

    user.is_active = True
    db.commit()
    return Response(status_code=204)

@user_module.get("/", response_model=list[User])
def read_all_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return user_functions.read_all_user(db, skip, limit)


@user_module.get("/{user_id}", response_model=User)
def read_user_by_id(user_id: int, db: Session = Depends(get_db)):
    return user_functions.get_user_by_id(db, user_id)


@user_module.patch("/{user_id}", response_model=User)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
):
    user = db.get(UserModel, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    data = payload.model_dump(exclude_unset=True)

    if "email" in data:
        new_email: str = data["email"]
        if not new_email.endswith("@selu.edu"):
            raise HTTPException(400, "Only @selu.edu email addresses are allowed")

        email_taken = (
            db.query(UserModel)
            .filter(UserModel.email == new_email, UserModel.id != user_id)
            .first()
        )
        if email_taken:
            raise HTTPException(409, "Email already in use")

    if "w_number" in data:
        w_taken = (
            db.query(UserModel)
            .filter(UserModel.w_number == data["w_number"], UserModel.id != user_id)
            .first()
        )
        if w_taken:
            raise HTTPException(409, "W-number already in use")

    for field, value in data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    logger.info("Updated user %s with %s", user_id, data)
    return user

@user_module.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user_functions.delete_user(db, user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
