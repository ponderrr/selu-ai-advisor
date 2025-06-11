from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import Annotated, List
from datetime import timedelta
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from app.schemas.user import User, UserLogin, Token
from app.core.dependencies import get_db, get_current_user
from app.core.settings import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
from app.api.endpoints.user import functions as user_functions
from app.models.user import User as UserModel
from app.models.user_session import UserSession
from app.schemas.session import SessionInfo, SessionList
from app.schemas.degree_program import DegreeProgramBase

auth_module = APIRouter()

@auth_module.post("/login", response_model=Token)
async def login_for_access_token(user: UserLogin, request: Request, db: Session = Depends(get_db)) -> Token:
    db_user = user_functions.authenticate_user(db, user=user)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
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
    
    # Create new session
    user_agent = request.headers.get("user-agent", "Unknown")
    ip_address = request.client.host if request.client else None
    
    session = UserSession(
        user_id=db_user.id,
        refresh_token=refresh_token,
        device_info=user_agent,
        ip_address=ip_address
    )
    db.add(session)
    db.commit()
    
    return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer")

@auth_module.post("/refresh", response_model=Token)
async def refresh_access_token(refresh_token: str, request: Request, db: Session = Depends(get_db)) -> Token:
    token_data = await user_functions.refresh_access_token(db, refresh_token)
    
    # Update session last activity
    session = db.query(UserSession).filter(
        UserSession.refresh_token == refresh_token,
        UserSession.is_active == True
    ).first()
    
    if session:
        session.last_activity = func.now()
        db.commit()
    
    return Token(**token_data)

@auth_module.get("/me")
async def read_current_user_me(
    current_user: Annotated[UserModel, Depends(get_current_user)]
):
    return {"status": "ok", "user_id": current_user.id}

@auth_module.get("/users/me", response_model=User)
async def read_current_user(
    current_user: Annotated[UserModel, Depends(get_current_user)]
) -> dict:
    degree_program = None
    if current_user.current_degree_program:
        degree_program = DegreeProgramBase(
            name=current_user.current_degree_program.name,
            concentration=current_user.current_degree_program.concentration,
            catalog_year=current_user.current_degree_program.catalog_year,
            total_hours=current_user.current_degree_program.total_hours
        )
    user_dict = current_user.__dict__.copy()
    user_dict["degree_program"] = degree_program
    return user_dict

@auth_module.get("/sessions", response_model=SessionList)
async def get_active_sessions(
    current_user: Annotated[UserModel, Depends(get_current_user)],
    db: Session = Depends(get_db)
) -> SessionList:
    sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_active == True
    ).all()
    
    return SessionList(sessions=[
        SessionInfo(
            id=session.id,
            device_info=session.device_info,
            ip_address=session.ip_address,
            created_at=session.created_at,
            last_activity=session.last_activity
        ) for session in sessions
    ])

@auth_module.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: int,
    current_user: Annotated[UserModel, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    session.is_active = False
    db.commit()

@auth_module.delete("/sessions/all", status_code=status.HTTP_204_NO_CONTENT)
async def delete_all_sessions(
    current_user: Annotated[UserModel, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_active == True
    ).update({"is_active": False})
    db.commit()