from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
import sqlalchemy as sa

from app.core.dependencies import get_db
from app.models.student_course import StudentCourse
from app.models.course import Course as CourseModel
from app.models.enums import CourseCategory, CourseLevel
from app.schemas.course import CourseCreate, CourseUpdate, CourseRead

course_module = APIRouter(prefix="/courses", tags=["courses"]) 

@course_module.get("/", response_model=list[CourseRead])
def list_courses(
    category: CourseCategory | None = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(CourseModel)
    if category:
        q = q.filter(CourseModel.category == category)
    return q.all()

@course_module.get("/search", response_model=list[CourseRead])
def search_courses(q: str, db: Session = Depends(get_db)):
    """
    Fuzzy search by title, level literal, credits, or category literal.
    """
    q_lower = q.lower()

    filters = [
        CourseModel.title.ilike(f"%{q_lower}%")
    ]

    try:
        filters.append(CourseModel.level == CourseLevel(q))
    except ValueError:
        pass

    try:
        filters.append(CourseModel.category == CourseCategory(q.upper()))
    except ValueError:
        pass

    if q.isdigit():
        filters.append(CourseModel.credits == float(q))

    return db.query(CourseModel).filter(sa.or_(*filters)).all()

@course_module.get("/{course_id}", response_model=CourseRead)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.get(CourseModel, course_id)
    if course is None:
        raise HTTPException(404, "Course not found")
    return course

@course_module.post("/", response_model=CourseRead, status_code=201)
def create_course(payload: CourseCreate, db: Session = Depends(get_db)):
    try:
        new_course = CourseModel(**payload.model_dump(by_alias=True))
        db.add(new_course)
        db.commit()
        db.refresh(new_course)
        return new_course

    except sa.exc.IntegrityError:
        db.rollback()
        raise HTTPException(409, "Course code already exists")

    except TypeError as e:
        raise HTTPException(422, detail=str(e))

@course_module.patch("/{course_id}", response_model=CourseRead)
def update_course(
    course_id: int,
    patch: CourseUpdate,
    db: Session = Depends(get_db)
):
    course = db.get(CourseModel, course_id)
    if course is None:
        raise HTTPException(404, "Course not found")

    for field, value in patch.model_dump(exclude_unset=True).items():
        setattr(course, field, value)

    db.commit()
    db.refresh(course)
    return course

@course_module.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = db.get(CourseModel, course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")

    linked = (
        db.query(StudentCourse)
        .filter(StudentCourse.course_id == course_id)
        .first()
    )
    if linked:
        raise HTTPException(
            status_code=409,
            detail="Course is still referenced by student-course records",
        )

    db.delete(course)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
