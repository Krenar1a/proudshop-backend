#!/bin/bash
# Complete fix for Alembic migration issues on Ubuntu VPS
# Run this on your VPS as root in /var/www/proudshop-backend

echo "🔧 Fixing Alembic migration issues..."

# Activate virtual environment
source .venv/bin/activate

# Step 1: Check current state
echo "📋 Checking current database state..."
python3 -c "
import os
from sqlalchemy import create_engine, text, inspect
engine = create_engine(os.getenv('DATABASE_URL'))
inspector = inspect(engine)

print('Existing tables:', inspector.get_table_names())

with engine.connect() as conn:
    try:
        result = conn.execute(text('SELECT version_num FROM alembic_version'))
        for row in result:
            print(f'Current alembic version: {row[0]}')
    except Exception as e:
        print(f'No alembic_version table: {e}')
"

# Step 2: Backup current database (just in case)
echo "💾 Creating database backup..."
pg_dump -h localhost -U proudshop_user -d proudshop > backup_$(date +%Y%m%d_%H%M%S).sql

# Step 3: Fix alembic_version table
echo "🔧 Fixing alembic_version table..."
python3 -c "
import os
from sqlalchemy import create_engine, text
engine = create_engine(os.getenv('DATABASE_URL'))
with engine.connect() as conn:
    # Drop existing alembic_version table
    conn.execute(text('DROP TABLE IF EXISTS alembic_version'))
    # Recreate with longer varchar
    conn.execute(text('CREATE TABLE alembic_version (version_num VARCHAR(64) NOT NULL PRIMARY KEY)'))
    conn.commit()
    print('✅ alembic_version table recreated with VARCHAR(64)')
"

# Step 4: Mark current state
echo "📝 Marking database as up-to-date..."
python3 -c "
import os
from sqlalchemy import create_engine, text, inspect
engine = create_engine(os.getenv('DATABASE_URL'))
inspector = inspect(engine)
tables = inspector.get_table_names()

# Check what migrations we need to mark as applied
has_products = 'products' in tables
has_images = False
has_shipping = False
has_chat = False
has_source_url = False
has_is_draft = False
has_timestamps = False
has_slug = False

if has_products:
    cols = {c['name'] for c in inspector.get_columns('products')}
    has_images = 'images' in cols
    has_source_url = 'source_url' in cols
    has_is_draft = 'is_draft' in cols
    has_timestamps = 'created_at' in cols and 'updated_at' in cols
    has_slug = 'slug' in cols

if 'orders' in tables:
    order_cols = {c['name'] for c in inspector.get_columns('orders')}
    has_shipping = 'shipping_name' in order_cols

has_chat = 'chat_sessions' in tables and 'chat_messages' in tables

# Determine latest migration based on what exists
latest_migration = '0001_initial'
if has_images:
    latest_migration = '0002_images'
if has_shipping:
    latest_migration = '0003_shipping'
if has_chat:
    latest_migration = '0004_chat_flags'
if has_source_url:
    latest_migration = '0005_source_url'
if has_is_draft:
    latest_migration = '0006_is_draft'
if has_timestamps:
    latest_migration = '0007_timestamps'
if has_slug:
    latest_migration = '0008_slug'

print(f'Database appears to be at migration: {latest_migration}')

# Mark as current
with engine.connect() as conn:
    conn.execute(text(f\"INSERT INTO alembic_version (version_num) VALUES ('{latest_migration}')\"))
    conn.commit()
    print(f'✅ Marked database as at migration {latest_migration}')
"

# Step 5: Run any remaining migrations
echo "⬆️ Running any remaining migrations..."
alembic upgrade head

# Step 6: Verify final state
echo "✅ Verifying final state..."
python3 -c "
import os
from sqlalchemy import create_engine, text, inspect
engine = create_engine(os.getenv('DATABASE_URL'))
inspector = inspect(engine)

print('Final tables:', inspector.get_table_names())

with engine.connect() as conn:
    result = conn.execute(text('SELECT version_num FROM alembic_version'))
    for row in result:
        print(f'Final alembic version: {row[0]}')

if 'products' in inspector.get_table_names():
    cols = [c['name'] for c in inspector.get_columns('products')]
    print('Products table columns:', cols)
"

echo "🎉 Migration fix complete! You can now restart your backend service."
echo "Run: sudo systemctl restart proudshop-backend"
