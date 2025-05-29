from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import student as student_model
from app.schemas import student as student_schema

student_router = APIRouter(prefix="/students", tags=["students"])

@student_router.post("/", response_model=student_schema.Student)
def create_student(student: student_schema.StudentCreate, db: Session = Depends(get_db)):
    db_student = student_model.Student(**student.dict())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@student_router.get("/", response_model=list[student_schema.Student])
def read_students(db: Session = Depends(get_db)):
    return db.query(student_model.Student).all()

@student_router.get("/{student_id}", response_model=student_schema.Student)
def read_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(student_model.Student).get(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student
