from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.schemas.user import UserCreate
from app.core.security import get_password_hash 

# Optional: import and hash password if your app uses hashing
# from app.core.security import get_password_hash

def create_admin():
    db = SessionLocal()

    admin_email = "admin@selu.edu"
    admin = db.query(User).filter_by(email=admin_email).first()

    if admin:
        print("[!] Admin already exists.")
        return

    new_admin = User(
        email=admin_email,
        password=get_password_hash("admin123"),  
        first_name="Admin",
        last_name="User",
        role=UserRole.ADMIN,
        w_number="W0000000"
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    print("[✔] Admin created:", new_admin.email)

    db.close()

if __name__ == "__main__":
    create_admin()
#admin@selu.edu