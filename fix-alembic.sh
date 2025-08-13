#!/bin/bash
# Fix Alembic revision ID length issue
# Run this on your VPS as root in /var/www/proudshop-backend

echo "🔧 Fixing Alembic revision ID length issue..."

# Activate virtual environment
source .venv/bin/activate

# Check current alembic version table structure
echo "Current alembic_version table:"
python3 -c "
import os
from sqlalchemy import create_engine, text
engine = create_engine(os.getenv('DATABASE_URL'))
with engine.connect() as conn:
    try:
        result = conn.execute(text('SELECT version_num FROM alembic_version'))
        for row in result:
            print(f'Current version: {row[0]}')
    except Exception as e:
        print(f'No alembic_version table yet: {e}')
    
    # Check table structure
    try:
        result = conn.execute(text('SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name = \'alembic_version\''))
        for row in result:
            print(f'Column: {row[0]}, Type: {row[1]}, Max Length: {row[2]}')
    except Exception as e:
        print(f'Could not check table structure: {e}')
"

# Drop and recreate alembic_version table with longer varchar
echo "Recreating alembic_version table with longer version_num field..."
python3 -c "
import os
from sqlalchemy import create_engine, text
engine = create_engine(os.getenv('DATABASE_URL'))
with engine.connect() as conn:
    conn.execute(text('DROP TABLE IF EXISTS alembic_version'))
    conn.execute(text('CREATE TABLE alembic_version (version_num VARCHAR(64) NOT NULL PRIMARY KEY)'))
    conn.commit()
    print('✅ alembic_version table recreated with VARCHAR(64)')
"

echo "Now run: alembic upgrade head"
