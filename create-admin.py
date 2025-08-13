#!/usr/bin/env python3
"""
Create admin user for ProudShop backend
Run: python3 create-admin.py
"""

import os
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from app.db.database import get_db
from app.models.admin import Admin
from app.core.security import get_password_hash
from sqlalchemy.orm import Session

def create_admin():
    """Create admin user"""
    
    # Get database session
    db = next(get_db())
    
    # Check if admin already exists
    existing_admin = db.query(Admin).filter(Admin.email == "admin@proudshop.com").first()
    if existing_admin:
        print("❌ Admin user already exists with email: admin@proudshop.com")
        return
    
    # Create admin user
    admin_data = {
        "email": "admin@proudshop.com",
        "name": "Admin",
        "password_hash": get_password_hash("admin123"),
        "role": "SUPER_ADMIN",
        "permissions": None
    }
    
    admin = Admin(**admin_data)
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    print("✅ Admin user created successfully!")
    print(f"📧 Email: {admin.email}")
    print(f"🔑 Password: admin123")
    print(f"👤 Role: {admin.role}")
    print(f"🆔 ID: {admin.id}")
    print("\n⚠️  IMPORTANT: Change the password after first login!")

if __name__ == "__main__":
    create_admin()
