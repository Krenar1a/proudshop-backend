from sqlalchemy import create_engine
from urllib.parse import urlparse
import sys
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import get_settings

settings = get_settings()

class Base(DeclarativeBase):
    pass

raw_url = settings.DATABASE_URL
if not raw_url:
    print("ERROR: DATABASE_URL environment variable is not set.", file=sys.stderr)
    raise SystemExit(1)

parsed = urlparse(raw_url)
supported_prefixes = ("postgresql+psycopg", "postgresql")
if not any(raw_url.startswith(p) for p in supported_prefixes):
    print(
        f"ERROR: Unsupported DATABASE_URL scheme '{parsed.scheme}'. Expected one of: postgresql+psycopg, postgresql.\n"
        f"Current value: {raw_url}\n"
        "Example: postgresql+psycopg://USER:PASS@HOST:5432/DBNAME",
        file=sys.stderr,
    )
    raise SystemExit(1)

engine = create_engine(raw_url, future=True, echo=settings.DEBUG)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
