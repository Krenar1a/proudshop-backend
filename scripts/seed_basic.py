import os
import random
from decimal import Decimal
from app.core.config import get_settings
from app.db.database import SessionLocal, Base, engine
from app.models.category import Category
from app.models.product import Product
from app.models.admin import Admin, AdminRole
from app.auth.security import get_password_hash

settings = get_settings()

BASIC_CATEGORIES = [
    ("Electronics", "electronics"),
    ("Clothing", "clothing"),
    ("Home", "home"),
    ("Books", "books"),
]

PRODUCTS = [
    ("Smartphone X", "High-end smartphone", 699.00, 69900.0, 50, "electronics"),
    ("Laptop Pro", "Powerful laptop", 1299.00, 129900.0, 20, "electronics"),
    ("T-Shirt Classic", "Comfortable cotton shirt", 19.99, 1999.0, 200, "clothing"),
    ("Cooking Pan", "Non-stick pan", 34.50, 3450.0, 80, "home"),
]

def main():
    print("Creating tables (if not exist)...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Admin
        admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
        existing_admin = db.query(Admin).filter(Admin.email == admin_email).first()
        if not existing_admin:
            admin = Admin(
                email=admin_email,
                name="Super Admin",
                password_hash=get_password_hash(os.getenv("ADMIN_PASSWORD", "admin123")),
                role=AdminRole.SUPER_ADMIN,
                permissions="[\"ALL\"]",
            )
            db.add(admin)
            print("Created default admin")

        # Categories
        slug_to_id = {}
        for name, slug in BASIC_CATEGORIES:
            cat = db.query(Category).filter(Category.slug == slug).first()
            if not cat:
                cat = Category(name=name, slug=slug)
                db.add(cat)
                db.flush()
                print("Inserted category", slug)
            slug_to_id[slug] = cat.id

        # Products
        for title, desc, price_eur, price_lek, stock, cat_slug in PRODUCTS:
            prod = db.query(Product).filter(Product.title == title).first()
            if not prod:
                prod = Product(
                    title=title,
                    description=desc,
                    price_eur=Decimal(str(price_eur)),
                    price_lek=Decimal(str(price_lek)),
                    stock=stock,
                    category_id=slug_to_id.get(cat_slug),
                )
                db.add(prod)
                print("Inserted product", title)
        db.commit()
        print("Seed complete")
    finally:
        db.close()

if __name__ == "__main__":
    main()
