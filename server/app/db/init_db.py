# app/db/init_db.py

from sqlalchemy.orm import Session
from datetime import date
from uuid import uuid4  # for generating chat session IDs

# Import your models (make sure these paths match your project structure)
from app.models.user import User, UserRole
from app.models.user_profile import UserProfile, ContactMethod
from app.models.academic_info import AcademicInfo
from app.models.major import Major
from app.models.concentration import Concentration
from app.models.degree_program import DegreeProgram
from app.models.course import Course, CourseCategory
from app.models.student_course import StudentCourse
from app.models.chat_message import ChatMessage

# Import your password-hashing function
from app.core.security import get_password_hash


async def init_db(db: Session) -> None:
    """
    Populates the database with initial development data.
    Run this on a clean (or existing) database AFTER migrations.
    """
    print("--- Initializing Database with Seed Data ---")

    # ── 1. Create Users (Admin, Advisor, Student) ─────────────────────────────

    # Admin user
    admin_user = db.query(User).filter_by(email="admin@selu.edu").first()
    if not admin_user:
        admin_user = User(
            w_number="W00000001",
            email="admin@selu.edu",
            password=get_password_hash("adminpass"),
            first_name="Admin",
            last_name="User",
            role=UserRole.ADMIN,
            preferred_name="Admin",
            secondary_email="admin.backup@example.com",
            expected_graduation_year=date.today().year,
            is_active=True,            # New field: mark them active
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"Created Admin user: {admin_user.email}")

    # Advisor user
    advisor_user = db.query(User).filter_by(email="advisor@selu.edu").first()
    if not advisor_user:
        advisor_user = User(
            w_number="W00000002",
            email="advisor@selu.edu",
            password=get_password_hash("advisorpass"),
            first_name="Dr.",
            last_name="Smith",
            role=UserRole.ADVISOR,
            preferred_name="Dr. Smith",
            secondary_email="dr.smith.office@example.com",
            expected_graduation_year=date.today().year + 5,
            is_active=True,
        )
        db.add(advisor_user)
        db.commit()
        db.refresh(advisor_user)
        print(f"Created Advisor user: {advisor_user.email}")

    # Student user
    student_user = db.query(User).filter_by(email="student@selu.edu").first()
    if not student_user:
        student_user = User(
            w_number="W00000003",
            email="student@selu.edu",
            password=get_password_hash("studentpass"),
            first_name="Alice",
            last_name="Student",
            role=UserRole.STUDENT,
            preferred_name="Alice",
            secondary_email="alice.personal@example.com",
            expected_graduation_year=date.today().year + 3,
            is_active=True,
        )
        db.add(student_user)
        db.commit()
        db.refresh(student_user)
        print(f"Created Student user: {student_user.email}")

    # Link the student to the advisor, if not already linked
    if advisor_user and (student_user.advisor_id is None):
        student_user.advisor_id = advisor_user.id
        db.add(student_user)
        db.commit()
        db.refresh(student_user)
        print(f"Linked Student ({student_user.email}) → Advisor ({advisor_user.email})")


    # ── 2. Create UserProfile for the Student ─────────────────────────────────

    existing_profile = (
        db.query(UserProfile)
        .filter_by(user_id=student_user.id)
        .first()
    )
    if not existing_profile:
        student_profile = UserProfile(
            user_id=student_user.id,
            bio="A dedicated computer science student at SELU.",
            profile_picture_url="https://example.com/alice_avatar.jpg",
            phone_number="555-123-4567",
            preferred_contact_method=ContactMethod.EMAIL,
            emergency_contact_name="Jane Student (Mother)",
            emergency_contact_phone="555-987-6543",
            date_of_birth=date(2003, 5, 15),
            address_line1="123 University St",
            city="Hammond",
            state="LA",
            zip_code="70402",
        )
        db.add(student_profile)
        db.commit()
        db.refresh(student_profile)
        print(f"Created UserProfile for student: {student_user.email}")


    # ── 3. Create Major & Concentration ────────────────────────────────────────

    bs_cs_major = db.query(Major).filter_by(name="Computer Science").first()
    if not bs_cs_major:
        bs_cs_major = Major(
            name="Computer Science",
            description="Bachelor of Science in Computer Science",
            total_credits_required=120,
        )
        db.add(bs_cs_major)
        db.commit()
        db.refresh(bs_cs_major)
        print(f"Created Major: {bs_cs_major.name}")

    se_concentration = (
        db.query(Concentration)
        .filter_by(name="Software Engineering", major_id=bs_cs_major.id)
        .first()
    )
    if not se_concentration:
        se_concentration = Concentration(
            major_id=bs_cs_major.id,
            name="Software Engineering",
            description="Concentration in Software Engineering",
        )
        db.add(se_concentration)
        db.commit()
        db.refresh(se_concentration)
        print(f"Created Concentration: {se_concentration.name}")


    # ── 4. Create AcademicInfo for the Student ─────────────────────────────────

    existing_academic_info = (
        db.query(AcademicInfo)
        .filter_by(user_id=student_user.id)
        .first()
    )
    if not existing_academic_info:
        student_academic_info = AcademicInfo(
            user_id=student_user.id,
            major_id=bs_cs_major.id,
            concentration_id=se_concentration.id,
            enrollment_date=date(2023, 8, 20),
            expected_graduation_semester="Spring",
            expected_graduation_year=student_user.expected_graduation_year,
            academic_standing="Good Standing",
            current_semester="Fall 2024",
            campus="Hammond Campus",
        )
        db.add(student_academic_info)
        db.commit()
        db.refresh(student_academic_info)
        print(f"Created AcademicInfo for student: {student_user.email}")


    # ── 5. Create DegreeProgram and link to Student ────────────────────────────

    bs_cs_degree = (
        db.query(DegreeProgram)
        .filter_by(name="B.S. Computer Science", catalog_year=2023)
        .first()
    )
    if not bs_cs_degree:
        bs_cs_degree = DegreeProgram(
            name="B.S. Computer Science",
            concentration="General",
            catalog_year=2023,
            total_hours=120,
            category_requirements={
                "English": 12.0,
                "Natural Science": 12.0,
                "Math": 19.0,
                "Computer Science": 54.0,
                "Elective": 9.0,
                "General Education": 12.0,
            },
        )
        db.add(bs_cs_degree)
        db.commit()
        db.refresh(bs_cs_degree)
        print(f"Created Degree Program: {bs_cs_degree.name}")

    if (student_user.current_degree_program_id is None) and bs_cs_degree:
        student_user.current_degree_program_id = bs_cs_degree.id
        db.add(student_user)
        db.commit()
        db.refresh(student_user)
        print(
            f"Set Student ({student_user.email}) → DegreeProgram ({bs_cs_degree.name})"
        )


    # ── 6. Create Courses ───────────────────────────────────────────────────────

    courses_to_create = [
        {
            "code": "CMPS 161",
            "title": "Algorithmic Process",
            "credits": 3.0,
            "description": "Intro to algorithms.",
            "category": CourseCategory.COMPUTER_SCIENCE,
        },
        {
            "code": "CMPS 280",
            "title": "Programming II",
            "credits": 3.0,
            "description": "Advanced programming.",
            "category": CourseCategory.COMPUTER_SCIENCE,
        },
        {
            "code": "CMPS 390",
            "title": "Data Structures",
            "credits": 3.0,
            "description": "Fundamental data structures.",
            "category": CourseCategory.COMPUTER_SCIENCE,
        },
        {
            "code": "CMPS 415",
            "title": "Operating Systems",
            "credits": 3.0,
            "description": "OS principles.",
            "category": CourseCategory.COMPUTER_SCIENCE,
        },
        {
            "code": "MATH 163",
            "title": "Trigonometry",
            "credits": 3.0,
            "description": "Intro to trig.",
            "category": CourseCategory.MATH,
        },
        {
            "code": "MATH 200",
            "title": "Calculus I",
            "credits": 3.0,
            "description": "Calculus basics.",
            "category": CourseCategory.MATH,
        },
        {
            "code": "ENGL 101",
            "title": "English Composition I",
            "credits": 3.0,
            "description": "Writing skills.",
            "category": CourseCategory.ENGLISH,
        },
        {
            "code": "HIST 101",
            "title": "World History",
            "credits": 3.0,
            "description": "World history survey.",
            "category": CourseCategory.GENERAL_EDUCATION,
        },
        {
            "code": "ARTS 101",
            "title": "Art Appreciation",
            "credits": 3.0,
            "description": "Appreciating art.",
            "category": CourseCategory.ELECTIVE,
        },
        {
            "code": "CMPS 411",
            "title": "Database Management Systems",
            "credits": 3.0,
            "description": "DBMS principles.",
            "category": CourseCategory.COMPUTER_SCIENCE,
        },
        {
            "code": "CMPS 401",
            "title": "Software Engineering",
            "credits": 3.0,
            "description": "SE methodologies.",
            "category": CourseCategory.COMPUTER_SCIENCE,
        },
        {
            "code": "CMPS 431",
            "title": "Computer Networks",
            "credits": 3.0,
            "description": "Network fundamentals.",
            "category": CourseCategory.COMPUTER_SCIENCE,
        },
    ]

    # Insert each course if it doesn't exist
    for data in courses_to_create:
        course_db = db.query(Course).filter_by(course_code=data["code"]).first()
        if not course_db:
            course_db = Course(
                course_code=data["code"],
                title=data["title"],
                description=data["description"],
                credits=data["credits"],
                category=data["category"].value,  # Enum → value
            )
            db.add(course_db)
            db.commit()
            db.refresh(course_db)
            print(f"Created Course: {course_db.course_code}")

    # Reload the Course objects for later
    cmps161_db = db.query(Course).filter_by(course_code="CMPS 161").first()
    cmps280_db = db.query(Course).filter_by(course_code="CMPS 280").first()
    cmps390_db = db.query(Course).filter_by(course_code="CMPS 390").first()
    cmps415_db = db.query(Course).filter_by(course_code="CMPS 415").first()
    math163_db = db.query(Course).filter_by(course_code="MATH 163").first()
    math200_db = db.query(Course).filter_by(course_code="MATH 200").first()
    engl101_db = db.query(Course).filter_by(course_code="ENGL 101").first()
    hist101_db = db.query(Course).filter_by(course_code="HIST 101").first()
    arts101_db = db.query(Course).filter_by(course_code="ARTS 101").first()
    cmps411_db = db.query(Course).filter_by(course_code="CMPS 411").first()
    cmps401_db = db.query(Course).filter_by(course_code="CMPS 401").first()
    cmps431_db = db.query(Course).filter_by(course_code="CMPS 431").first()


    # ── 7. Create StudentCourse entries for the Student ────────────────────────

    student_courses_to_create = [
        # Fall 2023
        {"course": cmps161_db, "grade": "A",  "semester": "Fall",   "year": 2023},
        {"course": engl101_db, "grade": "B+", "semester": "Fall",   "year": 2023},
        {"course": math163_db, "grade": "C",  "semester": "Fall",   "year": 2023},

        # Spring 2024
        {"course": cmps280_db, "grade": "B",  "semester": "Spring", "year": 2024},
        {"course": hist101_db, "grade": "A-", "semester": "Spring", "year": 2024},
        {"course": math200_db, "grade": "D",  "semester": "Spring", "year": 2024},

        # Fall 2024
        {"course": cmps390_db, "grade": "A",  "semester": "Fall",   "year": 2024},
        {"course": arts101_db, "grade": "P",  "semester": "Fall",   "year": 2024},
        {"course": cmps411_db, "grade": "C+", "semester": "Fall",   "year": 2024},

        # Spring 2025 (in-progress)
        {"course": cmps401_db, "grade": None, "semester": "Spring", "year": 2025},
        {"course": cmps431_db, "grade": None, "semester": "Spring", "year": 2025},
        {"course": cmps415_db, "grade": "F",  "semester": "Spring", "year": 2025},
    ]

    for sc in student_courses_to_create:
        if sc["course"] is None:
            # If a course lookup failed, skip it
            print(
                f"Skipped StudentCourse for {student_user.email} "
                "(missing course object)"
            )
            continue

        existing_sc = (
            db.query(StudentCourse)
            .filter_by(
                user_id=student_user.id,
                course_id=sc["course"].id,
                semester=sc["semester"],
                year=sc["year"],
            )
            .first()
        )
        if not existing_sc:
            new_sc = StudentCourse(
                user_id=student_user.id,
                course_id=sc["course"].id,
                grade=sc["grade"],
                semester=sc["semester"],
                year=sc["year"],
            )
            db.add(new_sc)
            db.commit()
            db.refresh(new_sc)
            print(
                f"Added StudentCourse: {student_user.email} - "
                f"{sc['course'].course_code} ({sc['semester']} {sc['year']})"
            )


    # ── 8. Create Sample Chat Messages (optional) ──────────────────────────────

    # Generate a random session_id for this example
    chat_session_id = uuid4()

    # Only add chat messages if none exist for this session
    if not db.query(ChatMessage).filter_by(session_id=chat_session_id).first():
        sample_chat_messages = [
            ChatMessage(
                user_id=student_user.id,
                session_id=chat_session_id,
                role="user",
                content="Hi, can you tell me about the Computer Science major requirements?"
            ),
            ChatMessage(
                user_id=student_user.id,
                session_id=chat_session_id,
                role="ai",
                content=(
                    "Certainly! The B.S. in Computer Science at SELU "
                    "typically requires 120 credit hours. Key areas include "
                    "core CS courses, math, natural sciences, and general electives. "
                    "What specifically would you like to know?"
                )
            ),
        ]
        db.add_all(sample_chat_messages)
        db.commit()
        print(f"Created sample chat messages for user: {student_user.email}")

    print("--- Database Initialization Complete ---")
