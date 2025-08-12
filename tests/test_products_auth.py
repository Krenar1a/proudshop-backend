from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

EMAIL = "prodadmin@example.com"
PWD = "testpass123"

def get_token():
    r = client.post("/api/v1/auth/login", json={"email": EMAIL, "password": PWD})
    if r.status_code != 200:
        r = client.post("/api/v1/auth/register", json={"email": EMAIL, "password": PWD})
    return r.json()["access_token"]

def test_product_protected():
    r = client.post("/api/v1/products/", json={"title": "Phone X", "price_eur": 10, "price_lek": 1000, "stock": 5})
    assert r.status_code == 401
    token = get_token()
    r2 = client.post("/api/v1/products/", json={"title": "Phone X", "price_eur": 10, "price_lek": 1000, "stock": 5}, headers={"Authorization": f"Bearer {token}"})
    assert r2.status_code in (200, 400)
    r3 = client.get("/api/v1/products/")
    assert r3.status_code == 200
    assert isinstance(r3.json(), list)
