from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.student_course import StudentCourse
from app.models.course import Course as CourseModel
from app.schemas.progress import ProgressResponse, ProgressCreate, ProgressUpdate, ProgressDetailedResponse, AnalyticsResponse
from app.services.progress_service import get_detailed_progress_for_student, get_semester_timeline_for_student, get_graduation_requirements_for_student, calculate_academic_analytics
from app.services.report_service import generate_report
from app.schemas.user import User as UserSchema
from app.schemas.degree_program import DegreeProgramBase

progress_module = APIRouter(prefix="/progress", tags=["progress"])


@progress_module.get("/", response_model=ProgressResponse)
def get_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    completed_hours = (
        db.query(func.coalesce(func.sum(CourseModel.credits), 0.0))
        .join(StudentCourse, StudentCourse.course_id == CourseModel.id)
        .filter(StudentCourse.user_id == current_user.id, StudentCourse.completed.is_(True))
        .scalar()
    )
    total_required = 120
    progress_percentage = (completed_hours / total_required * 100) if total_required else 0
    return ProgressResponse(
        w_number=current_user.w_number,
        completed_hours=completed_hours,
        total_required=total_required,
        progress_percentage=round(progress_percentage, 2)
    )


@progress_module.post("/", status_code=status.HTTP_201_CREATED)
def add_course_progress(
    course_data: ProgressCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = StudentCourse(
        user_id=current_user.id,
        course_id=course_data.course_id,
        completed=course_data.completed,
        grade=course_data.grade
    )
    db.add(record)
    db.commit()
    return {"msg": "Course added to progress"}


@progress_module.patch("/{course_id}")
def update_course_progress(
    course_id: int,
    update_data: ProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(StudentCourse).filter(
        StudentCourse.user_id == current_user.id,
        StudentCourse.course_id == course_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Course not found in your progress")
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    return {"msg": "Course progress updated"}


@progress_module.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_course_progress(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(StudentCourse).filter(
        StudentCourse.user_id == current_user.id,
        StudentCourse.course_id == course_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Course not found in your progress")
    db.delete(record)
    db.commit()


@progress_module.get("/detailed", response_model=ProgressDetailedResponse)
def get_detailed_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_detailed_progress_for_student(current_user, db)


@progress_module.get(
    "/semesters",
    responses={
        200: {
            "description": "Chronological semester data with courses and GPAs",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "year": 2023,
                            "semester": "Fall",
                            "courses": [
                                {"id": 1, "name": "Algorithmic Process", "credits": 3.0, "grade": "A", "completed": True},
                                {"id": 7, "name": "English Composition I", "credits": 3.0, "grade": "B", "completed": True},
                                {"id": 5, "name": "Trigonometry", "credits": 3.0, "grade": "C", "completed": True}
                            ],
                            "gpa": 3.0
                        },
                        {
                            "year": 2024,
                            "semester": "Spring",
                            "courses": [
                                {"id": 2, "name": "Programming II", "credits": 3.0, "grade": "B", "completed": True},
                                {"id": 8, "name": "World History", "credits": 3.0, "grade": "A", "completed": True},
                                {"id": 6, "name": "Calculus I", "credits": 3.0, "grade": "D", "completed": True}
                            ],
                            "gpa": 2.67
                        }
                    ]
                }
            }
        }
    }
)
def get_semester_timeline(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_semester_timeline_for_student(current_user, db)


@progress_module.get(
    "/graduation-requirements",
    responses={
        200: {
            "description": "Graduation requirements with status",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "name": "Total Credits",
                            "required": 120,
                            "completed": 36.0,
                            "met": False
                        },
                        {
                            "name": "Minimum GPA",
                            "required": 2.0,
                            "completed": 2.67,
                            "met": True
                        },
                        {
                            "name": "English Composition Credits",
                            "required": 6.0,
                            "completed": 3.0,
                            "met": False
                        }
                    ]
                }
            }
        }
    }
)
def get_graduation_requirements(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_graduation_requirements_for_student(current_user, db)


@progress_module.get(
    "/analytics",
    response_model=AnalyticsResponse,
    responses={
        200: {
            "description": "Academic analytics including GPA trends and performance metrics",
            "content": {
                "application/json": {
                    "example": {
                        "overall_metrics": {
                            "average_gpa": 3.45,
                            "highest_gpa": 3.8,
                            "lowest_gpa": 2.9,
                            "total_credits_earned": 45.0,
                            "grade_distribution": [
                                {"grade": "A", "count": 5, "percentage": 35.71},
                                {"grade": "B", "count": 7, "percentage": 50.0},
                                {"grade": "C", "count": 2, "percentage": 14.29},
                                {"grade": "D", "count": 0, "percentage": 0.0},
                                {"grade": "F", "count": 0, "percentage": 0.0}
                            ],
                            "gpa_trend": [
                                {
                                    "semester": "Fall",
                                    "year": 2023,
                                    "semester_gpa": 3.2,
                                    "cumulative_gpa": 3.2,
                                    "credits_earned": 15.0
                                },
                                {
                                    "semester": "Spring",
                                    "year": 2024,
                                    "semester_gpa": 3.7,
                                    "cumulative_gpa": 3.45,
                                    "credits_earned": 15.0
                                }
                            ],
                            "improvement_rate": 15.63,
                            "semester_comparison": {
                                "gpa_change": 0.5,
                                "credits_change": 0.0
                            }
                        },
                        "major_metrics": {
                            "average_gpa": 3.6,
                            "highest_gpa": 3.8,
                            "lowest_gpa": 3.4,
                            "total_credits_earned": 24.0,
                            "grade_distribution": [
                                {"grade": "A", "count": 4, "percentage": 50.0},
                                {"grade": "B", "count": 4, "percentage": 50.0},
                                {"grade": "C", "count": 0, "percentage": 0.0},
                                {"grade": "D", "count": 0, "percentage": 0.0},
                                {"grade": "F", "count": 0, "percentage": 0.0}
                            ],
                            "gpa_trend": [
                                {
                                    "semester": "Fall",
                                    "year": 2023,
                                    "semester_gpa": 3.4,
                                    "cumulative_gpa": 3.4,
                                    "credits_earned": 12.0
                                },
                                {
                                    "semester": "Spring",
                                    "year": 2024,
                                    "semester_gpa": 3.8,
                                    "cumulative_gpa": 3.6,
                                    "credits_earned": 12.0
                                }
                            ],
                            "improvement_rate": 11.76,
                            "semester_comparison": {
                                "gpa_change": 0.4,
                                "credits_change": 0.0
                            }
                        },
                        "general_education_metrics": {
                            "average_gpa": 3.3,
                            "highest_gpa": 3.5,
                            "lowest_gpa": 3.1,
                            "total_credits_earned": 21.0,
                            "grade_distribution": [
                                {"grade": "A", "count": 1, "percentage": 16.67},
                                {"grade": "B", "count": 3, "percentage": 50.0},
                                {"grade": "C", "count": 2, "percentage": 33.33},
                                {"grade": "D", "count": 0, "percentage": 0.0},
                                {"grade": "F", "count": 0, "percentage": 0.0}
                            ],
                            "gpa_trend": [
                                {
                                    "semester": "Fall",
                                    "year": 2023,
                                    "semester_gpa": 3.1,
                                    "cumulative_gpa": 3.1,
                                    "credits_earned": 9.0
                                },
                                {
                                    "semester": "Spring",
                                    "year": 2024,
                                    "semester_gpa": 3.5,
                                    "cumulative_gpa": 3.3,
                                    "credits_earned": 12.0
                                }
                            ],
                            "improvement_rate": 12.9,
                            "semester_comparison": {
                                "gpa_change": 0.4,
                                "credits_change": 3.0
                            }
                        },
                        "last_updated": "2024-03-20T15:30:00Z"
                    }
                }
            }
        }
    }
)
def get_academic_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get comprehensive academic analytics including GPA trends and performance metrics."""
    return calculate_academic_analytics(current_user, db)


@progress_module.get("/report/download")
def download_academic_report(
    format: str = 'pdf',
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download academic report in PDF or Excel format."""
    if format.lower() not in ['pdf', 'excel']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid format. Supported formats: pdf, excel"
        )
    
    buffer, mime_type, file_extension = generate_report(current_user, db, format)
    
    filename = f"academic_report_{current_user.w_number}_{datetime.now().strftime('%Y%m%d')}.{file_extension}"
    
    return StreamingResponse(
        buffer,
        media_type=mime_type,
        headers={
            'Content-Disposition': f'attachment; filename="{filename}"'
        }
    )
