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

## Deployment ne Render

1. Krijo nje Web Service (Python) dhe lidh repo-n.
2. Build Command:
```
pip install -r requirements.txt
```
3. Start Command:
```
uvicorn app.main:app --host 0.0.0.0 --port 10000
```
4. Environment Variables (vendos ne Render Dashboard):
	- SECRET_KEY = (gjenero nje string te forte)
	- DATABASE_URL = postgresql+psycopg://USER:PASS@HOST:5432/DB
	- BACKEND_CORS_ORIGINS = ["https://your-vercel-domain.vercel.app"]
	- DEBUG = false
	- (opsional) OPENAI_API_KEY, STRIPE_*, etj.
5. (Opsional) Shto nje Job ne Render per migrime manuale:
```
alembic upgrade head
```
6. Pas deploy mer URL p.sh. https://your-render-backend.onrender.com dhe vendose ne frontend si NEXT_PUBLIC_API_URL.

### Health Check
Root `/` kthen `{ "message": "ProudShop API OK" }`.

## Deployment i Frontend (Vercel)
Ne Vercel vendos env:
	- NEXT_PUBLIC_API_URL = https://your-render-backend.onrender.com/api/v1
	- STRIPE_* (nese perdoret)
	- FACEBOOK_* (nese perdoret)
	- OPENAI_API_KEY (nese perdoret vetem ne edge/server operations)

Vercel build perdor komandat egzistuese: `npm install` + `npm run build`.

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
