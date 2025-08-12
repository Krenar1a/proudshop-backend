from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

EMAIL = "authflow@example.com"
PWD = "testpass123"

def test_register_and_refresh():
    r = client.post("/api/v1/auth/register", json={"email": EMAIL, "password": PWD})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "access_token" in data and "refresh_token" in data

    # use refresh
    r2 = client.post("/api/v1/auth/refresh", json={"refresh_token": data["refresh_token"]})
    assert r2.status_code == 200
    d2 = r2.json()
    assert d2["access_token"] and d2["refresh_token"]
