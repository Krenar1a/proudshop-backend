#!/usr/bin/env python3
"""
Simple admin creation script for ProudShop
"""
import sys
import os

# Add the app directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Database connection
DATABASE_URL = "postgresql://proudshop_user:proudshop123@localhost/proudshop_db"

# Use the same password context as the backend
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash password using bcrypt (same as backend)"""
    return pwd_context.hash(password)

def create_admin():
    try:
        # Create engine and session
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()
        
        # Check if admin already exists
        result = db.execute(text("SELECT COUNT(*) FROM admins WHERE email = 'admin@proudshop.com'"))
        count = result.scalar()
        
        if count > 0:
            print("❌ Admin user already exists!")
            return False
        
        # Create password hash
        password_hash = hash_password("admin123")
        
        # Insert admin user
        db.execute(text("""
            INSERT INTO admins (email, name, password_hash, role, created_at, updated_at) 
            VALUES (:email, :name, :password_hash, :role, NOW(), NOW())
        """), {
            "email": "admin@proudshop.com",
            "name": "Admin User",
            "password_hash": password_hash,
            "role": "SUPER_ADMIN"
        })
        
        db.commit()
        print("✅ Admin user created successfully!")
        print("   Email: admin@proudshop.com")
        print("   Password: admin123")
        print("   Role: SUPER_ADMIN")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin user: {str(e)}")
        return False
    finally:
        if 'db' in locals():
            db.close()

if __name__ == "__main__":
    print("🔧 Creating admin user for ProudShop...")
    success = create_admin()
    if success:
        print("\n🎉 Admin creation completed! You can now login to the admin panel.")
    else:
        print("\n💥 Admin creation failed!")
