import pytest

from app.core import config


@pytest.fixture
def dev_sms(monkeypatch):
    monkeypatch.setattr(config.settings, "auth_dev_fixed_code", "123456")


@pytest.mark.asyncio
async def test_sms_login_and_me(client, dev_sms):
    phone = "13800138000"
    r = await client.post("/api/v1/auth/sms/send", json={"phone": phone})
    assert r.status_code == 200
    assert r.json().get("ok") is True

    r2 = await client.post("/api/v1/auth/sms/login", json={"phone": phone, "code": "123456"})
    assert r2.status_code == 200
    body = r2.json()
    assert "access_token" in body and "refresh_token" in body
    token = body["access_token"]

    r3 = await client.get(
        "/api/v1/user/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r3.status_code == 200
    me = r3.json()
    assert me["phone"] == phone
    assert "referral_code" in me


@pytest.mark.asyncio
async def test_refresh_token(client, dev_sms):
    phone = "13900139000"
    await client.post("/api/v1/auth/sms/send", json={"phone": phone})
    r = await client.post("/api/v1/auth/sms/login", json={"phone": phone, "code": "123456"})
    refresh = r.json()["refresh_token"]

    r2 = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh})
    assert r2.status_code == 200
    assert r2.json()["access_token"]


@pytest.mark.asyncio
async def test_me_unauthorized(client):
    r = await client.get("/api/v1/user/me")
    assert r.status_code == 401
    err = r.json()
    assert err.get("code") == "unauthorized"
