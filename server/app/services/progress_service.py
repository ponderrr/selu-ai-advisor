from sqlalchemy.orm import Session
from app.models.student_course import StudentCourse
from app.models.course import Course as CourseModel
from app.models.user import User
from app.schemas.progress import ProgressDetailedResponse, CategoryBreakdown, CourseInfo, StudentInfo, ProgressOverview, CategoryProgress
from sqlalchemy import func
from typing import List
from datetime import datetime
from app.models.enums import CourseCategory

def get_detailed_progress_for_student(user: User, db: Session) -> ProgressDetailedResponse:
    # Get student info
    student_info = StudentInfo(
        name=f"{user.first_name} {user.last_name}",
        program=user.current_degree_program.name if user.current_degree_program else "Undeclared",
        expectedGraduation=str(user.expected_graduation_year) if user.expected_graduation_year else "Not Set",
        studentId=user.w_number,
        status="On Track",  # TODO: Calculate based on progress
        advisorName=user.advisor.first_name + " " + user.advisor.last_name if user.advisor else None
    )

    # Get completed courses
    completed_courses = (
        db.query(StudentCourse)
        .filter(StudentCourse.user_id == user.id, StudentCourse.completed.is_(True))
        .all()
    )

    # Calculate overall progress
    total_required = 120  # TODO: Get from degree program
    completed_hours = 0.0
    total_points = 0.0
    total_credits_for_gpa = 0.0
    grade_to_points = {"A": 4, "B": 3, "C": 2, "D": 1, "F": 0}
    categories = {}

    # Process courses
    for sc in completed_courses:
        course = db.query(CourseModel).get(sc.course_id)
        if not course:
            continue
            
        completed_hours += course.credits
        if sc.grade and sc.grade.upper() in grade_to_points:
            points = grade_to_points[sc.grade.upper()]
            total_points += points * course.credits
            total_credits_for_gpa += course.credits

        # Categorize course
        cat = getattr(course, "category", "Other")
        if cat not in categories:
            categories[cat] = {
                "courses": [],
                "completed_credits": 0.0,
                "total_credits": 0.0,
                "total_points": 0.0,
                "total_credits_for_gpa": 0.0,
                "color": "#1976d2"  # Default color, TODO: Get from config
            }
        
        categories[cat]["courses"].append(course)
        categories[cat]["completed_credits"] += course.credits
        if sc.grade and sc.grade.upper() in grade_to_points:
            categories[cat]["total_points"] += grade_to_points[sc.grade.upper()] * course.credits
            categories[cat]["total_credits_for_gpa"] += course.credits

    # Calculate overall GPA
    overall_gpa = round(total_points / total_credits_for_gpa, 2) if total_credits_for_gpa else 0.0
    progress_percentage = (completed_hours / total_required * 100) if total_required else 0.0

    # Create overview
    overview = ProgressOverview(
        totalCredits=total_required,
        completedCredits=completed_hours,
        percentage=round(progress_percentage, 2),
        gpa={
            "overall": overall_gpa,
            "major": 0.0  # TODO: Calculate major GPA
        }
    )

    # Create category progress list
    category_progress = []
    for cat, data in categories.items():
        cat_gpa = round(data["total_points"] / data["total_credits_for_gpa"], 2) if data["total_credits_for_gpa"] else 0.0
        cat_courses = [
            CourseInfo(
                id=course.id,
                name=course.title,
                credits=course.credits,
                grade=next((sc.grade for sc in completed_courses if sc.course_id == course.id), None),
                completed=True
            )
            for course in data["courses"]
        ]
        
        category_progress.append(CategoryProgress(
            name=str(cat),
            completed=data["completed_credits"],
            total=data["total_credits"],
            percentage=round((data["completed_credits"] / data["total_credits"] * 100) if data["total_credits"] else 0.0, 2),
            color=data["color"],
            courses=cat_courses
        ))

    return ProgressDetailedResponse(
        student=student_info,
        overview=overview,
        categories=category_progress
    )

def get_semester_timeline_for_student(user: User, db: Session):
    all_courses = (
        db.query(StudentCourse)
        .filter(StudentCourse.user_id == user.id)
        .all()
    )
    
    semester_order = {"Spring": 1, "Summer": 2, "Fall": 3}
    timeline = {}
    
    # Group courses by semester
    for sc in all_courses:
        course = db.query(CourseModel).get(sc.course_id)
        if not course:
            continue
            
        key = (sc.year, sc.semester)
        if key not in timeline:
            timeline[key] = {
                "courses": [],
                "credits": 0.0,
                "points": 0.0,
                "credits_for_gpa": 0.0
            }
            
        timeline[key]["courses"].append((sc, course))
        timeline[key]["credits"] += course.credits
        
        if sc.grade and sc.grade.upper() in {"A", "B", "C", "D", "F"}:
            points = {"A": 4, "B": 3, "C": 2, "D": 1, "F": 0}[sc.grade.upper()]
            timeline[key]["points"] += points * course.credits
            timeline[key]["credits_for_gpa"] += course.credits
    
    # Calculate semester GPAs and cumulative GPA
    semester_list = []
    cumulative_points = 0.0
    cumulative_credits = 0.0
    
    for (year, semester) in sorted(timeline.keys(), key=lambda x: (x[0], semester_order.get(x[1], 0))):
        data = timeline[(year, semester)]
        
        # Calculate semester GPA
        semester_gpa = round(data["points"] / data["credits_for_gpa"], 2) if data["credits_for_gpa"] else None
        
        # Update cumulative GPA
        cumulative_points += data["points"]
        cumulative_credits += data["credits_for_gpa"]
        cumulative_gpa = round(cumulative_points / cumulative_credits, 2) if cumulative_credits else None
        
        # Determine semester status
        current_year = datetime.now().year
        current_semester = "Fall" if datetime.now().month >= 8 else "Spring"
        
        if year > current_year or (year == current_year and semester_order[semester] > semester_order[current_semester]):
            status = "Planned"
            status_color = "grey.500"
        elif year == current_year and semester == current_semester:
            status = "Current"
            status_color = "primary.main"
        else:
            status = "Completed"
            status_color = "success.main"
        
        # Format semester courses
        semester_courses = [
            {
                "id": course.id,
                "name": course.title,
                "credits": course.credits,
                "grade": sc.grade or "-",
                "completed": sc.completed
            }
            for sc, course in data["courses"]
        ]
        
        semester_list.append({
            "year": year,
            "semester": semester,
            "status": status,
            "statusColor": status_color,
            "courses": semester_courses,
            "credits": data["credits"],
            "semesterGPA": semester_gpa,
            "cumulativeGPA": cumulative_gpa
        })
    
    return semester_list

def get_graduation_requirements_for_student(user: User, db: Session):
    requirements = {
        "institutional": [],
        "academic": []
    }
    
    # Get degree program requirements
    if user.current_degree_program:
        program_requirements = user.current_degree_program.category_requirements or {}
    else:
        program_requirements = {}
    
    # Calculate total credits
    total_required = 120  # TODO: Get from degree program
    completed_hours = db.query(StudentCourse, CourseModel).join(
        CourseModel, 
        StudentCourse.course_id == CourseModel.id
    ).filter(
        StudentCourse.user_id == user.id, 
        StudentCourse.completed.is_(True)
    ).with_entities(
        func.coalesce(func.sum(CourseModel.credits), 0.0)
    ).scalar()
    
    # Add institutional requirements
    requirements["institutional"].append({
        "title": "Total Credits",
        "description": "Complete all required credit hours",
        "status": "completed" if completed_hours >= total_required else "in-progress",
        "details": f"{completed_hours}/{total_required} credits completed"
    })
    
    # Calculate GPA
    grade_to_points = {"A": 4, "B": 3, "C": 2, "D": 1, "F": 0}
    completed_courses = db.query(StudentCourse, CourseModel).join(
        CourseModel, 
        StudentCourse.course_id == CourseModel.id
    ).filter(
        StudentCourse.user_id == user.id, 
        StudentCourse.completed.is_(True)
    ).all()
    
    total_points = 0.0
    total_credits_for_gpa = 0.0
    for sc, course in completed_courses:
        if sc.grade and sc.grade.upper() in grade_to_points:
            total_points += grade_to_points[sc.grade.upper()] * course.credits
            total_credits_for_gpa += course.credits
    
    gpa = round(total_points / total_credits_for_gpa, 2) if total_credits_for_gpa else 0.0
    min_gpa = 2.0
    
    requirements["institutional"].append({
        "title": "Minimum GPA",
        "description": "Maintain minimum GPA requirement",
        "status": "completed" if gpa >= min_gpa else "in-progress",
        "details": f"Current GPA: {gpa} (Minimum: {min_gpa})"
    })
    
    # Add academic requirements by category
    for category, required_credits in program_requirements.items():
        try:
            # Convert category string to enum value
            category_enum = CourseCategory(category.upper())
            
            # Get all courses in this category
            category_courses = db.query(CourseModel).filter(
                CourseModel.category == category_enum
            ).all()
            
            # Calculate completed credits for this category
            category_credits = 0.0
            for course in category_courses:
                student_course = db.query(StudentCourse).filter(
                    StudentCourse.user_id == user.id,
                    StudentCourse.course_id == course.id,
                    StudentCourse.completed.is_(True)
                ).first()
                if student_course:
                    category_credits += course.credits
            
            requirements["academic"].append({
                "title": f"{category} Requirements",
                "description": f"Complete {required_credits} credits in {category}",
                "status": "completed" if category_credits >= required_credits else "in-progress",
                "details": f"{category_credits}/{required_credits} credits completed"
            })
        except ValueError:
            # Skip invalid category values
            continue
    
    return requirements

def calculate_performance_metrics(courses_data: List[tuple], db: Session) -> dict:
    """Calculate performance metrics for a set of courses."""
    grade_to_points = {"A": 4, "B": 3, "C": 2, "D": 1, "F": 0}
    grade_counts = {grade: 0 for grade in grade_to_points.keys()}
    total_credits = 0.0
    total_points = 0.0
    semester_data = {}
    
    for sc, course in courses_data:
        if sc.grade and sc.grade.upper() in grade_to_points:
            grade = sc.grade.upper()
            grade_counts[grade] += 1
            total_credits += course.credits
            total_points += grade_to_points[grade] * course.credits
            
            # Track semester data
            key = (sc.year, sc.semester)
            if key not in semester_data:
                semester_data[key] = {
                    "credits": 0.0,
                    "points": 0.0,
                    "courses": []
                }
            semester_data[key]["credits"] += course.credits
            semester_data[key]["points"] += grade_to_points[grade] * course.credits
            semester_data[key]["courses"].append((sc, course))
    
    # Calculate GPA metrics
    average_gpa = round(total_points / total_credits, 2) if total_credits else 0.0
    
    # Calculate semester GPAs and trends
    semester_order = {"Spring": 1, "Summer": 2, "Fall": 3}
    gpa_trend = []
    cumulative_points = 0.0
    cumulative_credits = 0.0
    
    for (year, semester) in sorted(semester_data.keys(), key=lambda x: (x[0], semester_order.get(x[1], 0))):
        data = semester_data[(year, semester)]
        semester_gpa = round(data["points"] / data["credits"], 2) if data["credits"] else 0.0
        cumulative_points += data["points"]
        cumulative_credits += data["credits"]
        cumulative_gpa = round(cumulative_points / cumulative_credits, 2) if cumulative_credits else 0.0
        
        gpa_trend.append({
            "semester": semester,
            "year": year,
            "semester_gpa": semester_gpa,
            "cumulative_gpa": cumulative_gpa,
            "credits_earned": data["credits"]
        })
    
    # Calculate grade distribution
    total_grades = sum(grade_counts.values())
    grade_distribution = [
        {
            "grade": grade,
            "count": count,
            "percentage": round((count / total_grades * 100), 2) if total_grades else 0.0
        }
        for grade, count in grade_counts.items()
    ]
    
    # Calculate improvement rate if there are at least 2 semesters
    improvement_rate = None
    if len(gpa_trend) >= 2:
        first_gpa = gpa_trend[0]["semester_gpa"]
        last_gpa = gpa_trend[-1]["semester_gpa"]
        improvement_rate = round(((last_gpa - first_gpa) / first_gpa * 100), 2) if first_gpa else 0.0
    
    # Calculate semester comparison
    semester_comparison = None
    if len(gpa_trend) >= 2:
        current_semester = gpa_trend[-1]
        previous_semester = gpa_trend[-2]
        semester_comparison = {
            "gpa_change": round(current_semester["semester_gpa"] - previous_semester["semester_gpa"], 2),
            "credits_change": round(current_semester["credits_earned"] - previous_semester["credits_earned"], 2)
        }
    
    return {
        "average_gpa": average_gpa,
        "highest_gpa": max([trend["semester_gpa"] for trend in gpa_trend]) if gpa_trend else 0.0,
        "lowest_gpa": min([trend["semester_gpa"] for trend in gpa_trend]) if gpa_trend else 0.0,
        "total_credits_earned": total_credits,
        "grade_distribution": grade_distribution,
        "gpa_trend": gpa_trend,
        "improvement_rate": improvement_rate,
        "semester_comparison": semester_comparison
    }

def calculate_academic_analytics(user: User, db: Session):
    """Get comprehensive academic analytics for a student."""
    from datetime import datetime
    
    # Get all completed courses
    completed_courses = (
        db.query(StudentCourse)
        .filter(StudentCourse.user_id == user.id, StudentCourse.completed.is_(True))
        .all()
    )
    
    # Prepare course data
    courses_data = []
    major_courses_data = []
    gen_ed_courses_data = []
    
    for sc in completed_courses:
        course = db.query(CourseModel).get(sc.course_id)
        if not course:
            continue
            
        courses_data.append((sc, course))
        
        # Categorize courses
        if course.category == "MAJOR":
            major_courses_data.append((sc, course))
        elif course.category == "GEN_ED":
            gen_ed_courses_data.append((sc, course))
    
    # Calculate metrics for each category
    overall_metrics = calculate_performance_metrics(courses_data, db)
    major_metrics = calculate_performance_metrics(major_courses_data, db) if major_courses_data else None
    gen_ed_metrics = calculate_performance_metrics(gen_ed_courses_data, db) if gen_ed_courses_data else None
    
    return {
        "overall_metrics": overall_metrics,
        "major_metrics": major_metrics,
        "general_education_metrics": gen_ed_metrics,
        "last_updated": datetime.utcnow().isoformat()
    } 