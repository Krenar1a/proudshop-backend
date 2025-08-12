# ProudShop Backend (FastAPI)

FastAPI backend që zëvendëson Prisma + Supabase.

## Stack
- FastAPI
- SQLAlchemy 2.x
- Alembic (migrime)
- PostgreSQL
- JWT Auth

## Setup Lokalisht
1. Krijo .env:
```
APP_NAME="ProudShop API"
DEBUG=true
SECRET_KEY="ndrysho-secretin"
DATABASE_URL="postgresql+psycopg://postgres:postgres@localhost:5432/proudshop"
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALGORITHM=HS256
```
2. Krijo database në Postgres:
```
createdb proudshop
```
3. Instalimi i paketave (krijo virtualenv):
```
pip install -r requirements.txt
```
4. Migrimet (opsional, për tani tabelat krijohen automatikisht në start):
```
alembic revision --autogenerate -m "init"
alembic upgrade head
```
5. Run server:
```
uvicorn app.main:app --reload --port 8000
```

## Endpoints Kryesore
- GET / -> health
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/categories/
- POST /api/v1/categories/ (protected plan)
- GET /api/v1/products/
- POST /api/v1/products/ (protected plan)
- GET /api/v1/customers/
- POST /api/v1/customers/
- GET /api/v1/orders/
- POST /api/v1/orders/
- GET /api/v1/cart/
- POST /api/v1/cart/

Seed (kategori + produkte + admin):
```
python -m scripts.seed_basic
```

## Hapat e Migrimit nga Next.js
1. Zëvendëso përdorimin e Prisma me thirrje HTTP (fetch) ndaj backend-it: p.sh. `/api/v1/products/`.
2. Krijo një utility në frontend për API (baseURL = env.NEXT_PUBLIC_API_URL).
3. Kur të jetë gati, hiq prisma + supabase varësitë.

## TODO (të ardhshëm)
- Auth middleware & role based guard për POST/PUT/DELETE.
- Modelet Chat, Marketing settings, AdminSettings.
- Rate limiting / logging / audit trail.
- Email service & password reset.
- Tests (pytest + httpx AsyncClient).
