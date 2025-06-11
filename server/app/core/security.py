from fastapi import Depends, HTTPException, status
from typing import Annotated
from app.core.dependencies import get_current_user
from app.models.user import User as UserModel
from passlib.context import CryptContext

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: Annotated[UserModel, Depends(get_current_user)]):
        if current_user.role not in self.allowed_roles:
            raise HTTPException(status_code=403, detail="Operation not permitted")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
