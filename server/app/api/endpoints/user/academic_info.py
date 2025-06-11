from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.academic_info import AcademicInfo
from app.models.major import Major
from app.models.concentration import Concentration
from app.schemas.user_profile import AcademicBlock
from app.schemas.academic import MajorOut, ConcentrationOut

academic_info_router = APIRouter(prefix="/users/me/academic", tags=["academic"])

@academic_info_router.get("", response_model=AcademicBlock)
def get_academic_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get academic information for the current user including:
    - Major and concentration
    - Expected graduation date
    - Academic standing
    - Current semester
    - Campus
    """
    academic_info = db.query(AcademicInfo).filter(
        AcademicInfo.user_id == current_user.id
    ).first()

    if not academic_info:
        return AcademicBlock(major="Undeclared")

    return AcademicBlock(
        major=academic_info.major.name if academic_info.major else "Undeclared",
        concentration=academic_info.concentration.name if academic_info.concentration else None,
        expected_graduation=(
            f"{academic_info.expected_graduation_semester} {academic_info.expected_graduation_year}"
            if academic_info.expected_graduation_year
            else None
        ),
        standing=academic_info.academic_standing,
        current_semester=academic_info.current_semester,
        campus=academic_info.campus
    )

@academic_info_router.put("", response_model=AcademicBlock)
def update_academic_info(
    academic_data: AcademicBlock,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update academic information for the current user
    """
    academic_info = db.query(AcademicInfo).filter(
        AcademicInfo.user_id == current_user.id
    ).first()

    if not academic_info:
        academic_info = AcademicInfo(user_id=current_user.id)
        db.add(academic_info)

    # Update major if provided
    if academic_data.major and academic_data.major != "Undeclared":
        major = db.query(Major).filter(Major.name == academic_data.major).first()
        if not major:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Major '{academic_data.major}' not found"
            )
        academic_info.major_id = major.id

    # Update concentration if provided
    if academic_data.concentration:
        concentration = db.query(Concentration).filter(
            Concentration.name == academic_data.concentration,
            Concentration.major_id == academic_info.major_id
        ).first()
        if not concentration:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Concentration '{academic_data.concentration}' not found for the selected major"
            )
        academic_info.concentration_id = concentration.id

    # Update other fields
    if academic_data.expected_graduation:
        try:
            semester, year = academic_data.expected_graduation.split()
            academic_info.expected_graduation_semester = semester
            academic_info.expected_graduation_year = int(year)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Expected graduation must be in format 'Semester Year' (e.g., 'Spring 2024')"
            )

    academic_info.academic_standing = academic_data.standing
    academic_info.current_semester = academic_data.current_semester
    academic_info.campus = academic_data.campus

    db.commit()
    db.refresh(academic_info)

    return get_academic_info(current_user, db) 