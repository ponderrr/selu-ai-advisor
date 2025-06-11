from sqlalchemy.orm import Session
from app.models.student_course import StudentCourse
from app.models.course import Course as CourseModel
from app.models.user import User
from app.schemas.progress import ProgressDetailedResponse, CategoryBreakdown, CourseInfo

def get_detailed_progress_for_student(user: User, db: Session) -> ProgressDetailedResponse:
    print(f"[DEBUG] Progress for user_id={user.id}, w_number={user.w_number}")
    student_name = f"{user.first_name} {user.last_name}"
    w_number = user.w_number
    total_required = 120

    completed_courses = (
        db.query(StudentCourse)
        .filter(StudentCourse.user_id == user.id, StudentCourse.completed.is_(True))
        .all()
    )
    print(f"[DEBUG] Found {len(completed_courses)} completed courses for user_id={user.id}")
    for sc in completed_courses:
        print(f"[DEBUG] StudentCourse: id={sc.id}, course_id={sc.course_id}, grade={sc.grade}, completed={sc.completed}, semester={sc.semester}, year={sc.year}")

    completed_hours = 0.0
    total_points = 0.0
    total_credits_for_gpa = 0.0
    grade_to_points = {"A": 4, "B": 3, "C": 2, "D": 1, "F": 0}
    categories = {}

    for sc in completed_courses:
        course = db.query(CourseModel).get(sc.course_id)
        if not course:
            continue
        completed_hours += course.credits
        if sc.grade and sc.grade.upper() in grade_to_points:
            points = grade_to_points[sc.grade.upper()]
            total_points += points * course.credits
            total_credits_for_gpa += course.credits
        cat = getattr(course, "category", "Other")
        if cat not in categories:
            categories[cat] = {
                "courses": [],
                "completed_credits": 0.0,
                "total_points": 0.0,
                "total_credits_for_gpa": 0.0
            }
        categories[cat]["courses"].append((sc, course))
        categories[cat]["completed_credits"] += course.credits
        if sc.grade and sc.grade.upper() in grade_to_points:
            categories[cat]["total_points"] += grade_to_points[sc.grade.upper()] * course.credits
            categories[cat]["total_credits_for_gpa"] += course.credits

    overall_gpa = round(total_points / total_credits_for_gpa, 2) if total_credits_for_gpa else None
    progress_percentage = (completed_hours / total_required * 100) if total_required else 0.0

    categories_list = []
    for cat, data in categories.items():
        cat_gpa = round(data["total_points"] / data["total_credits_for_gpa"], 2) if data["total_credits_for_gpa"] else 0.0
        cat_courses = [
            CourseInfo(
                id=course.id,
                name=course.title,
                credits=course.credits,
                grade=sc.grade,
                completed=sc.completed
            )
            for sc, course in data["courses"]
        ]
        categories_list.append(CategoryBreakdown(
            name=str(cat),
            required_credits=120,  # Set to 0 for now, update if you have this info
            completed_credits=data["completed_credits"],
            courses=cat_courses,
            gpa=cat_gpa
        ))

    return ProgressDetailedResponse(
        w_number=w_number,
        student_name=student_name,
        overall_gpa=overall_gpa,
        total_required=total_required,
        completed_hours=completed_hours,
        progress_percentage=round(progress_percentage, 2),
        categories=categories_list
    ) 