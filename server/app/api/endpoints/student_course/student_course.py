from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas.student_course import StudentCourseCreate, StudentCourseRead
from app.models.student_course import StudentCourse
from app.models.course import Course
from app.core.security import get_current_user
from app.models.user import User
from . import functions

student_course_module = APIRouter(prefix="/student-courses", tags=["student-courses"])


@student_course_module.post("/", response_model=StudentCourseRead, status_code=201)
def assign_course(
    payload: StudentCourseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return functions.assign_course_to_student(db, current_user.id, payload)


@student_course_module.get("/", response_model=list[StudentCourseRead])
def get_all_student_courses(db: Session = Depends(get_db)):
    return functions.get_all(db)


@student_course_module.get("/student/{user_id}", response_model=list[StudentCourseRead])
def get_by_student(user_id: int, db: Session = Depends(get_db)):
    return functions.get_by_student(db, user_id)


@student_course_module.get("/course/{course_id}", response_model=list[StudentCourseRead])
def get_by_course(course_id: int, db: Session = Depends(get_db)):
    return functions.get_by_course(db, course_id)


@student_course_module.put("/{course_id}", response_model=StudentCourseRead)
def update_student_course(
    course_id: int,
    payload: StudentCourseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return functions.update_student_course(db, current_user.id, course_id, payload)


@student_course_module.delete("/{course_id}")
def delete_student_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return functions.delete_student_course(db, current_user.id, course_id)


@student_course_module.get("/progress/{user_id}")
def get_student_progress(user_id: int, db: Session = Depends(get_db)):
    records = (
        db.query(StudentCourse)
        .filter(StudentCourse.user_id == user_id, StudentCourse.completed.is_(True))
        .all()
    )
    if not records:
        return {
            "user_id": user_id,
            "completed_courses": [],
            "GPA": 0.0,
            "total_credits": 0.0
        }

    grade_to_points = {"A": 4, "B": 3, "C": 2, "D": 1, "F": 0}
    total_points = 0.0
    total_credits = 0.0
    completed_courses = []

    for r in records:
        course = db.query(Course).get(r.course_id)
        if course:
            grade = (r.grade or "F").upper()
            points = grade_to_points.get(grade, 0)
            total_points += points * course.credits
            total_credits += course.credits
            completed_courses.append(
                {
                    "course": course.title,
                    "grade": grade,
                    "credits": course.credits,
                    "semester": r.semester,
                    "year": r.year
                }
            )

    gpa = round(total_points / total_credits, 2) if total_credits else 0.0

    return {
        "user_id": user_id,
        "completed_courses": completed_courses,
        "GPA": gpa,
        "total_credits": total_credits
    }
