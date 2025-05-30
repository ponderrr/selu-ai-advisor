from app.core.database import SessionLocal
from app.models.course import Course

def seed_courses():
    db = SessionLocal()

    courses = [
        Course(code="CSCI 101", title="Intro to Computer Science", credits=3, level="100"),
        Course(code="MATH 121", title="Calculus I", credits=4, level="100"),
        Course(code="ENGL 101", title="English Composition", credits=3, level="100"),
    ]

    db.add_all(courses)
    db.commit()
    db.close()
    print("Courses seeded.")

if __name__ == "__main__":
    seed_courses()
