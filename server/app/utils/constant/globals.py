from enum import Enum as PythonEnum

class UserRole(str, PythonEnum):
    ADMIN = "admin"
    STUDENT = "student"
    ADVISOR = "advisor"
