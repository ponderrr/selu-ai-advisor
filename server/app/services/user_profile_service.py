# app/services/user_profile_service.py
from sqlalchemy.orm import Session, joinedload
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.academic_info import AcademicInfo
from app.models.major import Major # Assuming this model exists
from app.models.concentration import Concentration # Assuming this model exists
from app.schemas.user_profile import UserProfileDetailedResponse, AcademicInfoSchema, ContactInfoSchema

async def get_user_profile_detailed(db: Session, user_id: int) -> UserProfileDetailedResponse:
    user = db.query(User).options(
        joinedload(User.user_profile),
        joinedload(User.academic_info).joinedload(AcademicInfo.major),
        joinedload(User.academic_info).joinedload(AcademicInfo.concentration)
    ).filter(User.id == user_id).first()

    if not user:
        raise ValueError("User not found.")

    contact_info = ContactInfoSchema(
        phone_number=user.user_profile.phone_number if user.user_profile else None,
        preferred_method=user.user_profile.preferred_contact_method if user.user_profile else None,
        emergency_name=user.user_profile.emergency_contact_name if user.user_profile else None,
        emergency_phone=user.user_profile.emergency_contact_phone if user.user_profile else None,
    )

    # Prepare AcademicInfoSchema
    # Need to handle potential None for academic_info, major, concentration
    major_name = user.academic_info.major.name if user.academic_info and user.academic_info.major else None
    concentration_name = user.academic_info.concentration.name if user.academic_info and user.academic_info.concentration else None

    academic_info = AcademicInfoSchema(
        major=major_name if major_name else "N/A", # Default if no major
        concentration=concentration_name,
        expected_graduation=f"{user.academic_info.expected_graduation_semester} {user.academic_info.expected_graduation_year}" if user.academic_info and user.academic_info.expected_graduation_semester and user.academic_info.expected_graduation_year else None,
        standing=user.academic_info.academic_standing if user.academic_info else None,
        current_semester=user.academic_info.current_semester if user.academic_info else None,
        campus=user.academic_info.campus if user.academic_info else None,
    )

    # Prepare UserProfileDetailedResponse
    profile_response = UserProfileDetailedResponse(
        id=user.id,
        firstName=user.first_name,
        lastName=user.last_name,
        preferredName=user.preferred_name,
        wNumber=user.w_number,
        email=user.email,
        secondaryEmail=user.secondary_email,
        avatar=user.user_profile.profile_picture_url if user.user_profile else None,
        academic=academic_info,
        contact=contact_info
    )
    return profile_response