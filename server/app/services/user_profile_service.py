# app/services/user_profile_service.py
from pathlib import Path
from uuid import uuid4
from sqlalchemy.orm import Session, joinedload

from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.academic_info import AcademicInfo
from app.schemas.user_profile import (
    AcademicBlock,
    ContactBlock,
    UserProfileDetailedResponse,
)

MEDIA_ROOT = Path("media/avatars")
MEDIA_ROOT.mkdir(parents=True, exist_ok=True)


def build_profile(db: Session, user_id: int) -> UserProfileDetailedResponse | None:
    user: User | None = (
        db.query(User)
        .options(
            joinedload(User.profile),
            joinedload(User.academic_info).joinedload(AcademicInfo.major),
            joinedload(User.academic_info).joinedload(AcademicInfo.concentration),
        )
        .filter(User.id == user_id)
        .first()
    )
    if user is None:
        return None

    # contact block
    if user.profile:
        contact = ContactBlock(
            phone_number=user.profile.phone_number,
            preferred_method=user.profile.preferred_contact_method,
            emergency_name=user.profile.emergency_contact_name,
            emergency_phone=user.profile.emergency_contact_phone,
        )
        avatar = user.profile.profile_picture_url
    else:
        contact, avatar = ContactBlock(), None

    # academic block
    if user.academic_info:
        ai = user.academic_info
        academic = AcademicBlock(
            major=ai.major.name if ai.major else "Undeclared",
            concentration=ai.concentration.name if ai.concentration else None,
            expected_graduation=(
                f"{ai.expected_graduation_semester} {ai.expected_graduation_year}"
                if ai.expected_graduation_year
                else None
            ),
            standing=ai.academic_standing,
            current_semester=ai.current_semester,
            campus=ai.campus,
        )
    else:
        academic = AcademicBlock(major="Undeclared")

    return UserProfileDetailedResponse(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        preferred_name=user.preferred_name,
        w_number=user.w_number,
        email=user.email,
        secondary_email=user.secondary_email,
        avatar=avatar,
        academic=academic,
        contact=contact,
    )


def update_blocks(
    db: Session, user_id: int, payload: ContactBlock | AcademicBlock
) -> UserProfileDetailedResponse:
    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == user_id)
        .first()
        or UserProfile(user_id=user_id)
    )
    academic = (
        db.query(AcademicInfo)
        .filter(AcademicInfo.user_id == user_id)
        .first()
        or AcademicInfo(user_id=user_id)
    )

    data = payload.model_dump(exclude_unset=True)

    # decide which class we got
    if isinstance(payload, ContactBlock):
        for f, v in data.items():
            setattr(profile, f, v)
        db.add(profile)
    else:
        for f, v in data.items():
            setattr(academic, f, v)
        db.add(academic)

    db.commit()
    return build_profile(db, user_id)


def save_avatar(
    db: Session, user_id: int, file_bytes: bytes, ext: str
) -> UserProfileDetailedResponse:
    avatar_name = f"{uuid4().hex}{ext}"
    (MEDIA_ROOT / avatar_name).write_bytes(file_bytes)

    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == user_id)
        .first()
        or UserProfile(user_id=user_id)
    )
    profile.profile_picture_url = f"/static/avatars/{avatar_name}"
    db.add(profile)
    db.commit()
    return build_profile(db, user_id)
