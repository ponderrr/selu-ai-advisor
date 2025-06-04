from fastapi import Depends, HTTPException, status
from typing import Annotated
from app.core.dependencies import get_db, oauth2_scheme
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.models.user import User as UserModel
from app.core.settings import SECRET_KEY, ALGORITHM
from app.api.endpoints.user.auth import read_current_user
from passlib.context import CryptContext
class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: Annotated[UserModel, Depends(read_current_user)]):
        if current_user.role not in self.allowed_roles:
            raise HTTPException(status_code=403, detail="Operation not permitted")


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)]
) -> UserModel:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("email")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(UserModel).filter(UserModel.email == email).first()
    if user is None:
        raise credentials_exception
    return user
