from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.student_course import StudentCourse
from app.schemas.student_course import StudentCourseCreate
from app.models.course import Course

def assign_course_to_student(db: Session, user_id: int, data: StudentCourseCreate):
    # Check if course exists
    course = db.query(Course).get(data.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if already assigned
    exists = (
        db.query(StudentCourse)
        .filter(
            StudentCourse.user_id == user_id,
            StudentCourse.course_id == data.course_id,
        )
        .first()
    )
    if exists:
        raise HTTPException(status_code=409, detail="Course already assigned to this student")

    record = StudentCourse(
        user_id=user_id,
        course_id=data.course_id,
        completed=data.completed,
        grade=data.grade,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def get_all(db: Session):
    return db.query(StudentCourse).all()

def get_by_student(db: Session, user_id: int):
    return db.query(StudentCourse).filter(StudentCourse.user_id == user_id).all()

def get_by_course(db: Session, course_id: int):
    return db.query(StudentCourse).filter(StudentCourse.course_id == course_id).all()

def update_student_course(db: Session, user_id: int, course_id: int, data: StudentCourseCreate):
    record = (
        db.query(StudentCourse)
        .filter(
            StudentCourse.user_id == user_id,
            StudentCourse.course_id == course_id,
        )
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Student course record not found")
    
    for key, value in data.model_dump().items():
        setattr(record, key, value)
    
    db.commit()
    db.refresh(record)
    return record

def delete_student_course(db: Session, user_id: int, course_id: int):
    record = (
        db.query(StudentCourse)
        .filter(
            StudentCourse.user_id == user_id,
            StudentCourse.course_id == course_id,
        )
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Student course record not found")
    
    db.delete(record)
    db.commit()
    return {"message": "Student course record deleted successfully"}
