#!/bin/bash
# Fix current PostgreSQL boolean default issue on VPS
# Run this on your VPS as root in /var/www/proudshop-backend

echo "🔧 Fixing PostgreSQL boolean migration issue..."

# Activate virtual environment
source .venv/bin/activate

# Step 1: Check current state and fix the partial migration
echo "📋 Checking and fixing current database state..."
python3 -c "
import os
from sqlalchemy import create_engine, text, inspect
engine = create_engine(os.getenv('DATABASE_URL'))
inspector = inspect(engine)

with engine.connect() as conn:
    # Check current alembic version
    try:
        result = conn.execute(text('SELECT version_num FROM alembic_version'))
        current_version = result.fetchone()[0]
        print(f'Current alembic version: {current_version}')
    except Exception as e:
        print(f'No alembic version found: {e}')
        current_version = None

    # Check what columns exist in products table
    if 'products' in inspector.get_table_names():
        cols = {c['name'] for c in inspector.get_columns('products')}
        print(f'Products table columns: {sorted(cols)}')
        
        # If we're stuck at 0003_shipping and products table exists but boolean columns don't,
        # we need to reset to a clean state
        if current_version == '0003_shipping' or not current_version:
            print('Resetting alembic version to allow clean migration...')
            # Reset to 0003 to allow 0004 to run cleanly
            conn.execute(text(\"DELETE FROM alembic_version\"))
            conn.execute(text(\"INSERT INTO alembic_version (version_num) VALUES ('0003_shipping')\"))
            conn.commit()
            print('✅ Reset to 0003_shipping for clean migration')
"

# Step 2: Reset any conflicting state and run migrations
echo "🔄 Running clean migrations..."

# First, make sure we're at a clean state for the failed migration
python3 -c "
import os
from sqlalchemy import create_engine, text, inspect
engine = create_engine(os.getenv('DATABASE_URL'))

with engine.connect() as conn:
    # Check if products table has the problematic columns from partial migration
    inspector = inspect(engine)
    if 'products' in inspector.get_table_names():
        cols = {c['name'] for c in inspector.get_columns('products')}
        
        # If is_featured exists but migration failed, we need to clean it up
        if 'is_featured' in cols:
            print('Removing partially added columns to allow clean migration...')
            try:
                conn.execute(text('ALTER TABLE products DROP COLUMN IF EXISTS is_featured'))
                conn.execute(text('ALTER TABLE products DROP COLUMN IF EXISTS is_offer'))
                conn.execute(text('ALTER TABLE products DROP COLUMN IF EXISTS discount_price_eur'))
                conn.execute(text('ALTER TABLE products DROP COLUMN IF EXISTS discount_price_lek'))
                conn.commit()
                print('✅ Cleaned up partial migration')
            except Exception as e:
                print(f'Cleanup error (may be expected): {e}')
        
        # Also clean up any chat tables that might be partially created
        try:
            conn.execute(text('DROP TABLE IF EXISTS chat_messages'))
            conn.execute(text('DROP TABLE IF EXISTS chat_sessions'))
            conn.commit()
            print('✅ Cleaned up partial chat tables')
        except Exception as e:
            print(f'Chat cleanup error (may be expected): {e}')
"

# Step 3: Now run migrations with fixed boolean defaults
echo "⬆️ Running fixed migrations..."
alembic upgrade head

# Step 4: Verify everything worked
echo "✅ Verifying final state..."
python3 -c "
import os
from sqlalchemy import create_engine, text, inspect
engine = create_engine(os.getenv('DATABASE_URL'))
inspector = inspect(engine)

print('Final tables:', inspector.get_table_names())

with engine.connect() as conn:
    result = conn.execute(text('SELECT version_num FROM alembic_version'))
    current_version = result.fetchone()[0]
    print(f'Final alembic version: {current_version}')

if 'products' in inspector.get_table_names():
    cols = [c['name'] for c in inspector.get_columns('products')]
    print('Products table columns:', sorted(cols))
    
    # Test that boolean columns work
    try:
        result = conn.execute(text('SELECT is_featured, is_offer FROM products LIMIT 1'))
        print('✅ Boolean columns working correctly')
    except Exception as e:
        print(f'Boolean column test: {e}')

if 'chat_sessions' in inspector.get_table_names():
    print('✅ Chat tables created successfully')
"

echo "🎉 Migration repair complete! You can now restart your backend service."
echo "Run: sudo systemctl restart proudshop-backend"
