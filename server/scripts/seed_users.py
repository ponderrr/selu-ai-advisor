from app.core.database import SessionLocal
from app.models.user import User
from app.utils.constant.globals import UserRole

def seed_users():
    print("📥 Starting user seeding...")
    db = SessionLocal()

    existing = db.query(User).first()
    if existing:
        print("⚠️ Users already exist. Skipping seeding.")
        db.close()
        return

    users = [
        User(
            email="admin@selu.edu",
            password="admin123",
            first_name="Admin",
            last_name="User",
            role=UserRole.ADMIN,
            is_active=True,
        ),
        User(
            email="student@selu.edu",
            password="student123",
            first_name="Student",
            last_name="Example",
            role=UserRole.USER,
            is_active=True,
        )
    ]

    db.add_all(users)
    db.commit()
    db.close()
    print("✅ Seeded users successfully.")

if __name__ == "__main__":
    seed_users()
from app.core.database import SessionLocal
from app.models.user import User
from app.utils.constant.globals import UserRole

def seed_users():
    print("📥 Starting user seeding...")
    db = SessionLocal()

    existing = db.query(User).first()
    if existing:
        print("⚠️ Users already exist. Skipping seeding.")
        db.close()
        return

    users = [
        User(
            email="admin@selu.edu",
            password="admin123",
            first_name="Admin",
            last_name="User",
            role=UserRole.ADMIN,
            is_active=True,
        ),
        User(
            email="student@selu.edu",
            password="student123",
            first_name="Student",
            last_name="Example",
            role=UserRole.USER,
            is_active=True,
        )
    ]

    db.add_all(users)
    db.commit()
    db.close()
    print("✅ Seeded users successfully.")

if __name__ == "__main__":
    seed_users()
