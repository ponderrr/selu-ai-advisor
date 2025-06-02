from fastapi import APIRouter
from app.api.endpoints.student_course.student_course import student_course_module

student_course_router = APIRouter()
student_course_router.include_router(
    student_course_module,
    prefix="/student-courses",
    tags=["student_courses"]
)
