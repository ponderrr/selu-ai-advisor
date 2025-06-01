from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.student_course import StudentCourse, StudentCourseCreate
from app.core.dependencies import get_db
from . import functions

student_course_module = APIRouter()

@student_course_module.post("/", response_model=StudentCourse)
def assign_course(
    data: StudentCourseCreate,
    db: Session = Depends(get_db)
):
    return functions.assign_course_to_student(db, data)

@student_course_module.get("/", response_model=list[StudentCourse])
def get_all_student_courses(db: Session = Depends(get_db)):
    return functions.get_all(db)

@student_course_module.get("/student/{student_id}", response_model=list[StudentCourse])
def get_by_student(student_id: str, db: Session = Depends(get_db)):
    return functions.get_by_student(db, student_id)

@student_course_module.get("/course/{course_id}", response_model=list[StudentCourse])
def get_by_course(course_id: int, db: Session = Depends(get_db)):
    return functions.get_by_course(db, course_id)

@student_course_module.get("/progress/{student_id}")
def get_student_progress(student_id: int, db: Session = Depends(get_db)):
    from app.models.student_course import StudentCourse
    from app.models.course import Course

    records = db.query(StudentCourse).filter(StudentCourse.student_id == student_id).all()

    total_points = 0
    total_credits = 0
    grade_to_points = {"A": 4, "B": 3, "C": 2, "D": 1, "F": 0}

    completed_courses = []
    for r in records:
        if r.completed:
            course = db.query(Course).filter(Course.id == r.course_id).first()
            if course:
                grade = r.grade or "F"
                points = grade_to_points.get(grade.upper(), 0)
                total_points += points * course.credits
                total_credits += course.credits
                completed_courses.append({
                    "course": course.title,
                    "grade": grade.upper(),
                    "credits": course.credits
                })

    gpa = round(total_points / total_credits, 2) if total_credits > 0 else 0.0

    return {
        "student_id": student_id,
        "completed_courses": completed_courses,
        "GPA": gpa
    }
