from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from datetime import timedelta
from sqlalchemy.orm import Session

from app.schemas.user import User, UserLogin, Token
from app.core.dependencies import get_db
from app.core.settings import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
from app.api.endpoints.user import functions as user_functions
from app.models.user import User as UserModel

auth_module = APIRouter()

@auth_module.post("/login", response_model=Token)
async def login_for_access_token(user: UserLogin, db: Session = Depends(get_db)) -> Token:
    db_user = user_functions.authenticate_user(db, user=user)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not db_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is not active. Please verify your email first.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = user_functions.create_access_token(
        data={"id": db_user.id, "email": db_user.email, "role": db_user.role.value},
        expires_delta=access_expires,
    )
    
    refresh_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = await user_functions.create_refresh_token(
        data={"id": db_user.id, "email": db_user.email, "role": db_user.role.value},
        expires_delta=refresh_expires,
    )
    
    return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer")

@auth_module.post("/refresh", response_model=Token)
async def refresh_access_token(refresh_token: str, db: Session = Depends(get_db)) -> Token:
    token_data = await user_functions.refresh_access_token(db, refresh_token)
    return Token(**token_data)

@auth_module.get("/me", response_model=User)
async def read_current_user(
    current_user: Annotated[UserModel, Depends(user_functions.get_current_user)]
) -> UserModel:
    return current_user

@auth_module.get("/users/me", response_model=User)
async def read_current_user(
    current_user: Annotated[UserModel, Depends(user_functions.get_current_user)]
) -> UserModel:
    return current_user