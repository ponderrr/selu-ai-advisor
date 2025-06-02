from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.dependencies import get_db
from app.models.user import User
from app.models.student_course import StudentCourse
from app.models.course import Course as CourseModel
from app.schemas.progress import ProgressResponse, ProgressCreate, ProgressUpdate
from app.core.security import get_current_user

progress_module = APIRouter(prefix="/progress", tags=["progress"])


@progress_module.get("/", response_model=ProgressResponse)
def get_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    completed_courses = (
        db.query(CourseModel)
        .join(StudentCourse, StudentCourse.course_id == CourseModel.id)
        .filter(StudentCourse.student_id == current_user.id, StudentCourse.completed == True)
        .all()
    )

    completed_hours = sum(course.credits for course in completed_courses)
    total_required = 120  # Placeholder, could be dynamic based on degree
    progress_percentage = (completed_hours / total_required) * 100 if total_required > 0 else 0

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
    student_course = StudentCourse(
        student_id=current_user.id,
        course_id=course_data.course_id,
        completed=course_data.completed,
        grade=course_data.grade
    )
    db.add(student_course)
    db.commit()
    db.refresh(student_course)
    return {"msg": "Course added to progress"}


@progress_module.patch("/{course_id}")
def update_course_progress(
    course_id: int,
    update_data: ProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student_course = db.query(StudentCourse).filter(
        StudentCourse.student_id == current_user.id,
        StudentCourse.course_id == course_id
    ).first()
    if not student_course:
        raise HTTPException(status_code=404, detail="Course not found in your progress")

    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(student_course, key, value)

    db.commit()
    db.refresh(student_course)
    return {"msg": "Course progress updated"}


@progress_module.delete("/{course_id}")
def remove_course_progress(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student_course = db.query(StudentCourse).filter(
        StudentCourse.student_id == current_user.id,
        StudentCourse.course_id == course_id
    ).first()
    if not student_course:
        raise HTTPException(status_code=404, detail="Course not found in your progress")

    db.delete(student_course)
    db.commit()
    return {"msg": "Course removed from progress"}
