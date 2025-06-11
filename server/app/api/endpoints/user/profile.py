from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.schemas.user_profile import UserProfileDetailedResponse, ContactBlock, AcademicBlock
from app.services.user_profile_service import build_profile, update_blocks, save_avatar
from app.models.user import User as UserModel
from pathlib import Path
from app.services.user_profile_service import remove_avatar as remove_avatar_service

profile_router = APIRouter(prefix="/users/me", tags=["profile"])

@profile_router.get("/me/profile", response_model=UserProfileDetailedResponse)
def get_my_profile(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = build_profile(db, current_user.id)
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@profile_router.put("/profile", response_model=UserProfileDetailedResponse)
def update_profile(
    payload: ContactBlock | AcademicBlock,
    user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = update_blocks(db, user.id, payload)
    return profile

@profile_router.post(
    "/avatar",
    response_model=UserProfileDetailedResponse,
    status_code=status.HTTP_200_OK,
)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ext = Path(file.filename).suffix.lower()
    if ext not in {".png", ".jpg", ".jpeg"}:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Avatar must be PNG or JPEG",
        )

    content = await file.read()  # async read from UploadFile
    profile = save_avatar(db, current_user.id, content, ext)
    return profile

@profile_router.delete("/avatar", response_model=UserProfileDetailedResponse)
def remove_avatar(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        profile = remove_avatar_service(db, current_user.id)
        return profile
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))