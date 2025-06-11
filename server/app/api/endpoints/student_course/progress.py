from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.student_course import StudentCourse
from app.models.course import Course as CourseModel
from app.schemas.progress import ProgressResponse, ProgressCreate, ProgressUpdate, ProgressDetailedResponse
from app.services.progress_service import get_detailed_progress_for_student

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
