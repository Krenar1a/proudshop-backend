#!/usr/bin/env python3
"""
Complete SQLite seed data for ProudShop backend
Run: python3 seed-complete.py
"""

import os
import sys
from pathlib import Path
from datetime import datetime, timezone

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Use the same password context as the backend
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash password using bcrypt (same as backend)"""
    return pwd_context.hash(password)

# Database connection - read from .env
DATABASE_URL = "sqlite:///./proudshop.db"
if os.getenv("DATABASE_URL"):
    DATABASE_URL = os.getenv("DATABASE_URL")

def create_admin(db):
    """Create admin user"""
    # Check if admin already exists
    result = db.execute(text("SELECT COUNT(*) FROM admins WHERE email = 'admin@proudshop.com'"))
    count = result.scalar()
    
    if count > 0:
        print("✅ Admin user already exists")
        return
    
    # Create password hash
    password_hash = hash_password("admin123")
    
    # Insert admin user
    db.execute(text("""
        INSERT INTO admins (email, name, password_hash, role, created_at) 
        VALUES (:email, :name, :password_hash, :role, :created_at)
    """), {
        "email": "admin@proudshop.com",
        "name": "Admin User",
        "password_hash": password_hash,
        "role": "SUPER_ADMIN",
        "created_at": datetime.now(timezone.utc)
    })
    
    print("✅ Admin user created: admin@proudshop.com / admin123")

def create_categories(db):
    """Create sample categories"""
    categories = [
        ("Elektronikë", "elektronike"),
        ("Rroba & Modë", "rroba"),
        ("Shtëpi & Kopsht", "shtepi"),
        ("Sport & Aktivitete", "sport"),
        ("Libra & Media", "libra"),
        ("Fëmijë & Lodra", "femije"),
        ("Bukuri & Shëndet", "bukuri"),
        ("Automjete", "automjete"),
    ]
    
    created = 0
    for name, slug in categories:
        # Check if category exists
        result = db.execute(text("SELECT COUNT(*) FROM categories WHERE slug = :slug"), {"slug": slug})
        if result.scalar() == 0:
            db.execute(text("""
                INSERT INTO categories (name, slug) 
                VALUES (:name, :slug)
            """), {"name": name, "slug": slug})
            created += 1
    
    print(f"✅ Created {created} categories")

def create_sample_products(db):
    """Create sample products"""
    # Get first category ID
    result = db.execute(text("SELECT id FROM categories LIMIT 1"))
    category_row = result.fetchone()
    if not category_row:
        print("❌ No categories found, skipping products")
        return
    
    category_id = category_row[0]
    
    products = [
        {
            "title": "Laptop HP EliteBook 840 G8",
            "description": "Laptop profesional me procesor Intel i7, 16GB RAM dhe 512GB SSD. Ideal për punë dhe biznes.",
            "price_eur": 1299.99,
            "price_lek": 129999,
            "stock": 8,
            "category_id": category_id,
            "is_featured": True,
            "slug": "laptop-hp-elitebook-840"
        },
        {
            "title": "iPhone 15 Pro Max",
            "description": "Telefoni më i fundit nga Apple me kamerë 48MP dhe A17 Pro chip. Ngjyra Titan Blue.",
            "price_eur": 1399.99,
            "price_lek": 139999,
            "discount_price_eur": 1299.99,
            "discount_price_lek": 129999,
            "stock": 12,
            "category_id": category_id,
            "is_offer": True,
            "slug": "iphone-15-pro-max"
        },
        {
            "title": "Samsung Galaxy S24 Ultra",
            "description": "Telefon Android flagship me S Pen, kamerë 200MP dhe ekran 6.8 inch Dynamic AMOLED.",
            "price_eur": 1199.99,
            "price_lek": 119999,
            "stock": 15,
            "category_id": category_id,
            "is_featured": True,
            "slug": "samsung-galaxy-s24-ultra"
        },
        {
            "title": "MacBook Air M2",
            "description": "Laptop Apple me chip M2, 13.6 inch Liquid Retina display dhe deri në 18 orë bateri.",
            "price_eur": 1099.99,
            "price_lek": 109999,
            "stock": 6,
            "category_id": category_id,
            "slug": "macbook-air-m2"
        },
        {
            "title": "Sony WH-1000XM5 Headphones",
            "description": "Kufje me noise canceling teknologji të avancuar dhe cilësi audio të lartë.",
            "price_eur": 399.99,
            "price_lek": 39999,
            "discount_price_eur": 349.99,
            "discount_price_lek": 34999,
            "stock": 25,
            "category_id": category_id,
            "is_offer": True,
            "slug": "sony-wh1000xm5-headphones"
        }
    ]
    
    created = 0
    for product in products:
        # Check if product exists
        result = db.execute(text("SELECT COUNT(*) FROM products WHERE slug = :slug"), {"slug": product["slug"]})
        if result.scalar() == 0:
            # Prepare values for insertion
            created_at = datetime.now(timezone.utc)
            
            db.execute(text("""
                INSERT INTO products (
                    title, description, price_eur, price_lek, 
                    discount_price_eur, discount_price_lek,
                    stock, category_id, is_featured, is_offer, is_draft, slug, 
                    created_at, updated_at
                ) VALUES (
                    :title, :description, :price_eur, :price_lek,
                    :discount_price_eur, :discount_price_lek,
                    :stock, :category_id, :is_featured, :is_offer, :is_draft, :slug,
                    :created_at, :updated_at
                )
            """), {
                "title": product["title"],
                "description": product["description"],
                "price_eur": product["price_eur"],
                "price_lek": product["price_lek"],
                "discount_price_eur": product.get("discount_price_eur"),
                "discount_price_lek": product.get("discount_price_lek"),
                "stock": product["stock"],
                "category_id": product["category_id"],
                "is_featured": product.get("is_featured", False),
                "is_offer": product.get("is_offer", False),
                "is_draft": product.get("is_draft", False),
                "slug": product["slug"],
                "created_at": created_at,
                "updated_at": created_at
            })
            created += 1
    
    print(f"✅ Created {created} sample products")

def main():
    """Run all seed functions"""
    print("🌱 Seeding ProudShop database...")
    
    try:
        # Create engine and session
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()
        
        # Test connection
        db.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
        
        # Run seeding
        create_admin(db)
        create_categories(db)
        create_sample_products(db)
        
        # Commit all changes
        db.commit()
        print("\n🎉 Database seeding completed successfully!")
        print("📧 Admin login: admin@proudshop.com / admin123")
        print("🏪 Sample categories and products created!")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        if 'db' in locals():
            db.rollback()
    finally:
        if 'db' in locals():
            db.close()

if __name__ == "__main__":
    main()
