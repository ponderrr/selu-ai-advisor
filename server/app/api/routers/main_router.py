from fastapi import APIRouter
from app.api.routers.user import user_router
from app.api.routers.student_course import student_course_router
from app.api.endpoints.course import course_module
from app.api.endpoints.student_course.progress import progress_module
from app.api.endpoints.chat import chat_router

router = APIRouter()

router.include_router(user_router)
router.include_router(student_course_router)
router.include_router(course_module)
router.include_router(progress_module)
router.include_router(chat_router)
