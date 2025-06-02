from app.core.database import SessionLocal
from app.models.student import Student

def seed_students():
    print("📥 Starting student seeding...")
    db = SessionLocal()

    count = db.query(Student).count()
    print(f"👀 Found {count} existing students.")

    if count > 2:
        print("⚠️ Students already exist. Skipping seeding.")
        db.close()
        return

    students = [
        Student(w_number="W000001", first_name="Alice", last_name="Smith", email="alice.smith@selu.edu", entry_year=2022),
        Student(w_number="W000002", first_name="Bob", last_name="Johnson", email="bob.johnson@selu.edu", entry_year=2023),
        Student(w_number="W000003", first_name="Charlie", last_name="Brown", email="charlie.brown@selu.edu", entry_year=2024),
    ]

    db.add_all(students)
    db.commit()
    db.close()
    print("✅ Seeded students successfully.")

if __name__ == "__main__":
    seed_students()
