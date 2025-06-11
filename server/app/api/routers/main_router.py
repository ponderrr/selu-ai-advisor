from fastapi import APIRouter
from app.api.routers.user import user_router
from app.api.endpoints.student_course.student_course import student_course_module
from app.api.endpoints.course import course_module
from app.api.endpoints.student_course.progress import progress_module
from app.api.endpoints.chat import chat_router
from app.api.endpoints.user.profile import profile_router
from app.api.endpoints.user.academic import academic_router
from app.api.endpoints.notification_settings import notification_module
from app.api.endpoints.degree_program.degree_program import degree_program_module

router = APIRouter(prefix="/api")

router.include_router(user_router)
router.include_router(student_course_module)
router.include_router(course_module)
router.include_router(progress_module)
router.include_router(chat_router)
router.include_router(profile_router)
router.include_router(academic_router)
router.include_router(notification_module)
router.include_router(degree_program_module)