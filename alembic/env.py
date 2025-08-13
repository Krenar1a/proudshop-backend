from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os, sys

# Calculate project root (directory containing 'app') relative to this file
CURRENT_DIR = os.path.dirname(__file__)
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, os.pardir))

# Add both project root and its parent just in case execution context differs
for p in {PROJECT_ROOT, os.path.dirname(PROJECT_ROOT)}:
    if p not in sys.path:
        sys.path.insert(0, p)

# Explicit sanity check to reduce confusing ModuleNotFoundError later
if not os.path.isdir(os.path.join(PROJECT_ROOT, 'app')):
    raise RuntimeError(f"Expected 'app' directory under {PROJECT_ROOT}, found: {os.listdir(PROJECT_ROOT)}")

from app.core.config import get_settings
from app.db.database import Base
from app.models import admin, category, product  # noqa: F401  (import models)

config = context.config
settings = get_settings()
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=Base.metadata, literal_binds=True, dialect_opts={"paramstyle": "named"})
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    connectable = engine_from_config(config.get_section(config.config_ini_section), prefix="sqlalchemy.", poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=Base.metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
