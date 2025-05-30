from app.core.database import SessionLocal
from app.models.course import Course

def seed_courses():
    print("📥 Starting course seeding...")
    db = SessionLocal()

    count = db.query(Course).count()
    print(f"👀 Found {count} existing courses.")

    if count > 0:
        print("⚠️ Courses already exist. Skipping seeding.")
        db.close()
        return

    courses = [
        Course(code="CSCI 101", title="Intro to Computer Science", credits=3, level="100"),
        Course(code="MATH 121", title="Calculus I", credits=4, level="100"),
        Course(code="ENGL 101", title="English Composition", credits=3, level="100"),
    ]

    db.add_all(courses)
    db.commit()
    db.close()
    print("✅ Seeded courses successfully.")

if __name__ == "__main__":
    seed_courses()
