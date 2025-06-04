# app/db/init_db.py
from sqlalchemy.orm import Session
from datetime import date
from uuid import uuid4 # For session_id in chat_messages

# Import all your models
from app.models.user import User, UserRole # Assuming UserRole is defined in user.py
from app.models.user_profile import UserProfile, ContactMethod # Assuming ContactMethod is defined in user_profile.py
from app.models.academic_info import AcademicInfo
from app.models.major import Major
from app.models.concentration import Concentration
from app.models.degree_program import DegreeProgram
from app.models.course import Course, CourseCategory # Assuming CourseCategory is defined in course.py
from app.models.student_course import StudentCourse
from app.models.chat_message import ChatMessage # For seeding chat history

# Import security functions for password hashing
from app.core.security import get_password_hash # Assuming you have this

async def init_db(db: Session) -> None:
    """
    Populates the database with initial development data.
    Run this on a clean database after migrations.
    """
    print("--- Initializing Database with Seed Data ---")

    # --- 1. Create Users (Admin, Advisor, Student) ---
    # Ensure all user fields are populated including new ones
    admin_user = db.query(User).filter(User.email == "admin@selu.edu").first()
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
            expected_graduation_year=date.today().year # Default for admin
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"Created Admin: {admin_user.email}")

    advisor_user = db.query(User).filter(User.email == "advisor@selu.edu").first()
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
            expected_graduation_year=date.today().year + 5 # Default for advisor
        )
        db.add(advisor_user)
        db.commit()
        db.refresh(advisor_user)
        print(f"Created Advisor: {advisor_user.email}")

    student_user = db.query(User).filter(User.email == "student@selu.edu").first()
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
            expected_graduation_year=date.today().year + 3 # Graduate in 3 years
        )
        db.add(student_user)
        db.commit()
        db.refresh(student_user)
        print(f"Created Student: {student_user.email}")

    # Set advisor_id for student AFTER advisor is created
    if student_user.advisor_id is None and advisor_user:
        student_user.advisor_id = advisor_user.id
        db.add(student_user) # Mark as modified
        db.commit()
        db.refresh(student_user)


    # --- 2. Create User Profiles (for users) ---
    # Ensure profile_picture_url, phone_number, preferred_contact_method, etc., are set
    existing_profile = db.query(UserProfile).filter(UserProfile.user_id == student_user.id).first()
    if not existing_profile:
        student_profile = UserProfile(
            user_id=student_user.id,
            bio="A dedicated computer science student at SELU.",
            profile_picture_url="https://example.com/alice_avatar.jpg", # Sample URL
            phone_number="555-123-4567",
            preferred_contact_method=ContactMethod.EMAIL, # From user_profile.py enum
            emergency_contact_name="Jane Student (Mother)",
            emergency_contact_phone="555-987-6543",
            date_of_birth=date(2003, 5, 15), # Example date of birth
            address_line1="123 University St",
            city="Hammond",
            state="LA",
            zip_code="70402"
        )
        db.add(student_profile)
        db.commit()
        db.refresh(student_profile)
        print(f"Created UserProfile for student {student_user.email}")


    # --- 3. Create Majors and Concentrations ---
    bs_cs_major = db.query(Major).filter(Major.name == "Computer Science").first()
    if not bs_cs_major:
        bs_cs_major = Major(
            name="Computer Science",
            description="Bachelor of Science in Computer Science",
            total_credits_required=120 # As per curriculum
        )
        db.add(bs_cs_major)
        db.commit()
        db.refresh(bs_cs_major)
        print(f"Created Major: {bs_cs_major.name}")

    se_concentration = db.query(Concentration).filter(Concentration.name == "Software Engineering").first()
    if not se_concentration:
        se_concentration = Concentration(
            major_id=bs_cs_major.id,
            name="Software Engineering",
            description="Concentration in Software Engineering"
        )
        db.add(se_concentration)
        db.commit()
        db.refresh(se_concentration)
        print(f"Created Concentration: {se_concentration.name}")


    # --- 4. Create Academic Info (for student) ---
    existing_academic_info = db.query(AcademicInfo).filter(AcademicInfo.user_id == student_user.id).first()
    if not existing_academic_info:
        student_academic_info = AcademicInfo(
            user_id=student_user.id,
            major_id=bs_cs_major.id,
            concentration_id=se_concentration.id,
            enrollment_date=date(2023, 8, 20),
            expected_graduation_semester="Spring", # As per JSON
            expected_graduation_year=student_user.expected_graduation_year,
            academic_standing="Good Standing", # As per JSON
            current_semester="Fall 2024", # As per JSON
            campus="Hammond Campus" # As per JSON
        )
        db.add(student_academic_info)
        db.commit()
        db.refresh(student_academic_info)
        print(f"Created AcademicInfo for student {student_user.email}")


    bs_cs_degree = db.query(DegreeProgram).filter(DegreeProgram.name == "B.S. Computer Science").first()
    if not bs_cs_degree:
        bs_cs_degree = DegreeProgram(
            name="B.S. Computer Science",
            concentration="General", 
            catalog_year=2023,
            total_hours=120,
            # category_requirements from curriculum document
            category_requirements={
                "English": 12.0,
                "Natural Science": 12.0,
                "Math": 19.0,
                "Computer Science": 54.0,
                "Elective": 9.0,
                "General Education": 12.0 # Placeholder/calculated from curriculum
            }
        )
        db.add(bs_cs_degree)
        db.commit()
        db.refresh(bs_cs_degree)
        print(f"Created Degree Program: {bs_cs_degree.name}")

    if student_user.current_degree_program_id is None and bs_cs_degree:
        student_user.current_degree_program_id = bs_cs_degree.id
        db.add(student_user)
        db.commit()
        db.refresh(student_user)


    # --- 6. Create Courses (with categories, matching new schema) ---
    courses_to_create = [
        {"code": "CMPS 161", "title": "Algorithmic Process", "credits": 3.0, "description": "Intro to algorithms.", "category": CourseCategory.COMPUTER_SCIENCE},
        {"code": "CMPS 280", "title": "Programming II", "credits": 3.0, "description": "Advanced programming.", "category": CourseCategory.COMPUTER_SCIENCE},
        {"code": "CMPS 390", "title": "Data Structures", "credits": 3.0, "description": "Fundamental data structures.", "category": CourseCategory.COMPUTER_SCIENCE},
        {"code": "CMPS 415", "title": "Operating Systems", "credits": 3.0, "description": "OS principles.", "category": CourseCategory.COMPUTER_SCIENCE},
        {"code": "MATH 163", "title": "Trigonometry", "credits": 3.0, "description": "Intro to trig.", "category": CourseCategory.MATH},
        {"code": "MATH 200", "title": "Calculus I", "credits": 3.0, "description": "Calculus basics.", "category": CourseCategory.MATH},
        {"code": "ENGL 101", "title": "English Composition I", "credits": 3.0, "description": "Writing skills.", "category": CourseCategory.ENGLISH}, # New category
        {"code": "HIST 101", "title": "World History", "credits": 3.0, "description": "World history survey.", "category": CourseCategory.GENERAL_EDUCATION}, # New category
        {"code": "ARTS 101", "title": "Art Appreciation", "credits": 3.0, "description": "Appreciating art.", "category": CourseCategory.ELECTIVE},
        {"code": "CMPS 411", "title": "Database Management Systems", "credits": 3.0, "description": "DBMS principles.", "category": CourseCategory.COMPUTER_SCIENCE},
        {"code": "CMPS 401", "title": "Software Engineering", "credits": 3.0, "description": "SE methodologies.", "category": CourseCategory.COMPUTER_SCIENCE},
        {"code": "CMPS 431", "title": "Computer Networks", "credits": 3.0, "description": "Network fundamentals.", "category": CourseCategory.COMPUTER_SCIENCE},
    ]

    for course_data in courses_to_create:
        course_db = db.query(Course).filter(Course.course_code == course_data["code"]).first()
        if not course_db:
            course_db = Course(
                course_code=course_data["code"],
                title=course_data["title"],
                description=course_data["description"],
                credits=course_data["credits"],
                category=course_data["category"].value # Use .value for Enum
            )
            db.add(course_db)
            db.commit()
            db.refresh(course_db)
            print(f"Created Course: {course_db.course_code}")

    # Retrieve created courses for linking (using different var names to avoid conflict)
    cmps161_db = db.query(Course).filter(Course.course_code == "CMPS 161").first()
    cmps280_db = db.query(Course).filter(Course.course_code == "CMPS 280").first()
    cmps390_db = db.query(Course).filter(Course.course_code == "CMPS 390").first()
    cmps415_db = db.query(Course).filter(Course.course_code == "CMPS 415").first()
    math163_db = db.query(Course).filter(Course.course_code == "MATH 163").first()
    math200_db = db.query(Course).filter(Course.course_code == "MATH 200").first()
    engl101_db = db.query(Course).filter(Course.course_code == "ENGL 101").first()
    hist101_db = db.query(Course).filter(Course.course_code == "HIST 101").first()
    arts101_db = db.query(Course).filter(Course.course_code == "ARTS 101").first()
    cmps411_db = db.query(Course).filter(Course.course_code == "CMPS 411").first()
    cmps401_db = db.query(Course).filter(Course.course_code == "CMPS 401").first()
    cmps431_db = db.query(Course).filter(Course.course_code == "CMPS 431").first()


    # --- 7. Create StudentCourse entries for the student (for GPA and Progress) ---
    student_courses_to_create = [
        # Year 1 (Fall 2023)
        {"user": student_user, "course": cmps161_db, "grade": "A", "semester": "Fall", "year": 2023},
        {"user": student_user, "course": engl101_db, "grade": "B+", "semester": "Fall", "year": 2023},
        {"user": student_user, "course": math163_db, "grade": "C", "semester": "Fall", "year": 2023},
        
        # Year 1 (Spring 2024)
        {"user": student_user, "course": cmps280_db, "grade": "B", "semester": "Spring", "year": 2024},
        {"user": student_user, "course": hist101_db, "grade": "A-", "semester": "Spring", "year": 2024},
        {"user": student_user, "course": math200_db, "grade": "D", "semester": "Spring", "year": 2024},

        # Year 2 (Fall 2024)
        {"user": student_user, "course": cmps390_db, "grade": "A", "semester": "Fall", "year": 2024},
        {"user": student_user, "course": arts101_db, "grade": "P", "semester": "Fall", "year": 2024},
        {"user": student_user, "course": cmps411_db, "grade": "C+", "semester": "Fall", "year": 2024},

        # Year 2 (Spring 2025) - Simulating current/in-progress
        {"user": student_user, "course": cmps401_db, "grade": None, "semester": "Spring", "year": 2025},
        {"user": student_user, "course": cmps431_db, "grade": None, "semester": "Spring", "year": 2025},
        {"user": student_user, "course": cmps415_db, "grade": "F", "semester": "Spring", "year": 2025},
    ]

    for sc_data in student_courses_to_create:
        existing_sc = db.query(StudentCourse).filter(
            StudentCourse.user_id == sc_data["user"].id,
            StudentCourse.course_id == sc_data["course"].id,
            StudentCourse.semester == sc_data["semester"],
            StudentCourse.year == sc_data["year"]
        ).first()

        if not existing_sc and sc_data["course"] is not None: # Ensure course object is not None before adding
            student_course = StudentCourse(
                user_id=sc_data["user"].id,
                course_id=sc_data["course"].id,
                grade=sc_data["grade"],
                semester=sc_data["semester"],
                year=sc_data["year"]
            )
            db.add(student_course)
            db.commit()
            db.refresh(student_course)
            print(f"Added StudentCourse: {sc_data['user'].email} - {sc_data['course'].course_code}")
        elif sc_data["course"] is None:
            print(f"Skipped StudentCourse for {sc_data['user'].email} due to missing course object in seed data.")


    # --- 8. Create Sample Chat Messages (optional for chat history testing) ---
    chat_session_id = uuid4()
    if not db.query(ChatMessage).filter(ChatMessage.session_id == chat_session_id).first():
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
                content="Certainly! The B.S. in Computer Science at SELU typically requires 120 credit hours. Key areas include core CS courses, math, natural sciences, and general electives. What specifically would you like to know?"
            )
        ]
        db.add_all(sample_chat_messages)
        db.commit()
        print(f"Created sample chat messages for user {student_user.email}")


    print("--- Database Initialization Complete ---")