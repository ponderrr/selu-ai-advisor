from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_

from app.models.course import Course
from app.models.student_course import StudentCourse
from app.models.prerequisite import Prerequisite
from app.schemas.course import CourseRecommendation

class RecommendationService:
    def __init__(self, db: Session):
        self.db = db

    def get_course_recommendations(self, user_id: int, limit: int = 5) -> List[CourseRecommendation]:
        """
        Get course recommendations for a student based on their progress.
        """
        # Get student's completed courses
        completed_courses = (
            self.db.query(StudentCourse)
            .filter(
                StudentCourse.user_id == user_id,
                StudentCourse.completed == True
            )
            .all()
        )
        
        completed_course_ids = {sc.course_id for sc in completed_courses}
        
        if not completed_course_ids:
            # If no courses completed, recommend level 100 courses
            base_courses = (
                self.db.query(Course)
                .filter(Course.level == "100")
                .limit(limit)
                .all()
            )
            return [
                CourseRecommendation(
                    course=course,
                    confidence_score=0.8,
                    reason="Recommended as a starting course"
                )
                for course in base_courses
            ]

        # Get courses that have prerequisites met
        eligible_courses = []
        for course in self.db.query(Course).all():
            if course.id in completed_course_ids:
                continue

            # Check prerequisites
            prerequisites = (
                self.db.query(Prerequisite)
                .filter(Prerequisite.course_id == course.id)
                .all()
            )

            if not prerequisites:
                eligible_courses.append((course, 0.7, "No prerequisites required"))
                continue

            # Check if all prerequisites are met
            prereq_met = True
            for prereq in prerequisites:
                if prereq.prerequisite_course_id not in completed_course_ids:
                    prereq_met = False
                    break

            if prereq_met:
                # Calculate confidence based on grades in prerequisite courses
                confidence = 0.8
                reason = "Prerequisites completed"
                
                # Check if student performed well in related courses
                related_courses = (
                    self.db.query(StudentCourse)
                    .filter(
                        StudentCourse.user_id == user_id,
                        StudentCourse.course_id.in_(completed_course_ids)
                    )
                    .all()
                )
                
                good_grades = sum(1 for sc in related_courses if sc.grade in ['A', 'B'])
                if good_grades:
                    confidence += 0.1
                    reason += " with good performance in related courses"
                
                eligible_courses.append((course, confidence, reason))

        # Sort by confidence score and limit results
        eligible_courses.sort(key=lambda x: x[1], reverse=True)
        return [
            CourseRecommendation(
                course=course,
                confidence_score=score,
                reason=reason
            )
            for course, score, reason in eligible_courses[:limit]
        ] 