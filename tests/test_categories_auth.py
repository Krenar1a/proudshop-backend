from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

EMAIL = "catadmin@example.com"
PWD = "testpass123"

def get_token():
    r = client.post("/api/v1/auth/login", json={"email": EMAIL, "password": PWD})
    if r.status_code != 200:
        r = client.post("/api/v1/auth/register", json={"email": EMAIL, "password": PWD})
    data = r.json()
    return data["access_token"]

def test_category_protected():
    # POST pa token -> 401
    r = client.post("/api/v1/categories/", json={"name": "TestCat", "slug": "test-cat"})
    assert r.status_code == 401

    token = get_token()
    r2 = client.post("/api/v1/categories/", json={"name": "TestCat", "slug": "test-cat"}, headers={"Authorization": f"Bearer {token}"})
    assert r2.status_code in (200, 400)  # 400 nëse ekziston
    r3 = client.get("/api/v1/categories/")
    assert r3.status_code == 200
    assert isinstance(r3.json(), list)
