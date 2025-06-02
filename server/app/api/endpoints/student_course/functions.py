from sqlalchemy.orm import Session
from app.models.student_course import StudentCourse
from app.schemas.student_course import StudentCourseCreate

def assign_course_to_student(db: Session, data: StudentCourseCreate):
    record = StudentCourse(**data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def get_all(db: Session):
    return db.query(StudentCourse).all()

def get_by_student(db: Session, student_id: str):
    return db.query(StudentCourse).filter(StudentCourse.student_id == student_id).all()

def get_by_course(db: Session, course_id: int):
    return db.query(StudentCourse).filter(StudentCourse.course_id == course_id).all()
