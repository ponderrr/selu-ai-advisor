from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import sqlalchemy as sa

from app.core.dependencies import get_db
from app.schemas.course import Course as CourseSchema
from app.models.course import Course as CourseModel
from app.schemas.course import CourseCreate
from app.schemas.course import CourseUpdate

course_module = APIRouter(prefix="/courses", tags=["courses"])


@course_module.get("/", response_model=list[CourseSchema])
def get_all_courses(db: Session = Depends(get_db)):
    return db.query(CourseModel).all()


@course_module.get("/search", response_model=list[CourseSchema])
def search_courses(
    q: str,
    db: Session = Depends(get_db)
):
    query = db.query(CourseModel)

    filters = []

    filters.append(CourseModel.level == q)

    if q.isdigit():
        filters.append(CourseModel.credits == int(q))

    filters.append(CourseModel.title.ilike(f"%{q}%"))

    return query.filter(sa.or_(*filters)).all()


@course_module.get("/{course_id}", response_model=CourseSchema)
def get_course_by_id(course_id: int, db: Session = Depends(get_db)):
    course = db.query(CourseModel).filter(CourseModel.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@course_module.post("/", response_model=CourseSchema)
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    new_course = CourseModel(**course.model_dump())
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

@course_module.patch("/{course_id}", response_model=CourseSchema)
def update_course(course_id: int, update: CourseUpdate, db: Session = Depends(get_db)):
    course = db.query(CourseModel).filter(CourseModel.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(course, field, value)

    db.commit()
    db.refresh(course)
    return course

@course_module.delete("/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(CourseModel).filter(CourseModel.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    db.delete(course)
    db.commit()
    return {"detail": "Course deleted"}

