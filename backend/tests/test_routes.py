import pytest


@pytest.mark.asyncio
async def test_root(client):
    r = await client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert "name" in data
    assert "/api/v1" in data.get("api", "")


@pytest.mark.asyncio
async def test_health_ok(client):
    r = await client.get("/api/v1/health")
    assert r.status_code == 200
    body = r.json()
    assert body.get("service") == "uniai-video-api"
    assert body.get("database") == "ok"
    assert body.get("redis") in ("ok", "skipped", "error")


@pytest.mark.asyncio
async def test_request_id_header(client):
    r = await client.get("/api/v1/health", headers={"X-Request-ID": "my-trace-1"})
    assert r.status_code == 200
    assert r.headers.get("X-Request-ID") == "my-trace-1"
