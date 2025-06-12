from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.academic_info import AcademicInfo
from app.models.degree_program import DegreeProgram
from app.schemas.onboarding import OnboardingProgressResponse

class AcademicStatusOption(BaseModel):
    value: str
    label: str
    class Config:
        json_schema_extra = {
            "example": [
                {"value": "freshman", "label": "New freshman"},
                {"value": "transfer", "label": "Transfer student (with transfer credits)"},
                {"value": "continuing", "label": "Continuing student"},
                {"value": "returning", "label": "Returning student"},
                {"value": "graduate", "label": "Graduate student"}
            ]
        }

class GraduationYearOptions(BaseModel):
    semesters: List[str]
    years: List[str]
    class Config:
        json_schema_extra = {
            "example": {
                "semesters": ["Fall", "Spring", "Summer"],
                "years": [2024, 2025, 2026, 2027, 2028, 2029, "2030+"]
            }
        }

class DepartmentOption(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None
    class Config:
        json_schema_extra = {
            "example": [
                {
                    "id": 1,
                    "name": "College of Science and Technology",
                    "code": "CST",
                    "description": "Computer Science, IT, Engineering programs"
                }
            ]
        }

onboarding_router = APIRouter(prefix="/onboarding", tags=["onboarding"])

@onboarding_router.get("/progress", response_model=OnboardingProgressResponse)
def get_onboarding_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    academic_info = db.query(AcademicInfo).filter(
        AcademicInfo.user_id == current_user.id
    ).first()
    completed_steps = []
    missing_fields = []
    current_step = 1
    if academic_info and academic_info.major_id:
        completed_steps.append("academic_profile")
    else:
        missing_fields.append("academic_profile")
        current_step = 1
    if not completed_steps:
        current_step = 1
    elif "academic_profile" in completed_steps:
        current_step = 2
        missing_fields.append("course_history")
    return OnboardingProgressResponse(
        isOnboardingComplete=len(missing_fields) == 0,
        currentStep=current_step,
        completedSteps=completed_steps,
        missingFields=missing_fields,
        lastUpdated=datetime.utcnow()
    )

@onboarding_router.get("/academic-statuses", response_model=List[AcademicStatusOption])
def get_academic_statuses():
    return [
        {"value": "freshman", "label": "New freshman"},
        {"value": "transfer", "label": "Transfer student (with transfer credits)"},
        {"value": "continuing", "label": "Continuing student"},
        {"value": "returning", "label": "Returning student"},
        {"value": "graduate", "label": "Graduate student"}
    ]

@onboarding_router.get("/graduation-years", response_model=GraduationYearOptions)
def get_graduation_years():
    now = datetime.utcnow()
    current_year = now.year
    years = [str(current_year + i) for i in range(5)] + ["2030+"]
    return {"semesters": ["Fall", "Spring", "Summer"], "years": years}

@onboarding_router.get("/departments", response_model=List[DepartmentOption])
def get_departments(db: Session = Depends(get_db)):
    programs = db.query(DegreeProgram).order_by(DegreeProgram.name).all()
    departments = []
    for program in programs:
        code = "".join([word[0].upper() for word in program.name.split()[:3]])
        description = f"Degree program with {program.total_hours} credit hours"
        if program.concentration:
            description += f", {program.concentration} concentration"
        departments.append({
            "id": program.id,
            "name": program.name,
            "code": code,
            "description": description
        })
    return departments 