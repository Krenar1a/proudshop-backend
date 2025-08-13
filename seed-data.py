#!/usr/bin/env python3
"""
Seed basic data for ProudShop backend
Run: python3 seed-data.py
"""

import os
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from app.db.database import get_db
from app.models.admin import Admin
from app.models.category import Category
from app.models.product import Product
from app.core.security import get_password_hash
from sqlalchemy.orm import Session

def create_admin():
    """Create admin user"""
    db = next(get_db())
    
    existing_admin = db.query(Admin).filter(Admin.email == "admin@proudshop.com").first()
    if existing_admin:
        print("✅ Admin user already exists")
        return existing_admin
    
    admin = Admin(
        email="admin@proudshop.com",
        name="Admin",
        password_hash=get_password_hash("admin123"),
        role="SUPER_ADMIN"
    )
    
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print("✅ Admin user created: admin@proudshop.com / admin123")
    return admin

def create_categories():
    """Create sample categories"""
    db = next(get_db())
    
    categories = [
        ("Elektronike", "elektronike"),
        ("Rroba", "rroba"),
        ("Shtëpi", "shtepi"),
        ("Sport", "sport"),
        ("Libra", "libra"),
    ]
    
    created = 0
    for name, slug in categories:
        existing = db.query(Category).filter(Category.slug == slug).first()
        if not existing:
            category = Category(name=name, slug=slug)
            db.add(category)
            created += 1
    
    db.commit()
    print(f"✅ Created {created} categories")

def create_sample_products():
    """Create sample products"""
    db = next(get_db())
    
    # Get first category
    category = db.query(Category).first()
    if not category:
        print("❌ No categories found, skipping products")
        return
    
    products = [
        {
            "title": "Laptop HP EliteBook",
            "description": "Laptop i ri me specifikime të larta",
            "price_eur": 899.99,
            "price_lek": 89999,
            "stock": 10,
            "category_id": category.id,
            "is_featured": True,
            "slug": "laptop-hp-elitebook"
        },
        {
            "title": "Telefon Samsung Galaxy",
            "description": "Telefon i fundit Samsung",
            "price_eur": 699.99,
            "price_lek": 69999,
            "stock": 5,
            "category_id": category.id,
            "is_offer": True,
            "discount_price_eur": 599.99,
            "discount_price_lek": 59999,
            "slug": "telefon-samsung-galaxy"
        }
    ]
    
    created = 0
    for product_data in products:
        existing = db.query(Product).filter(Product.slug == product_data["slug"]).first()
        if not existing:
            product = Product(**product_data)
            db.add(product)
            created += 1
    
    db.commit()
    print(f"✅ Created {created} sample products")

def main():
    """Run all seed functions"""
    print("🌱 Seeding ProudShop database...")
    
    try:
        create_admin()
        create_categories()
        create_sample_products()
        print("\n🎉 Database seeding completed successfully!")
        print("📧 Admin login: admin@proudshop.com / admin123")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
