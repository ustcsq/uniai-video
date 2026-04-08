import asyncio
import json
from unittest.mock import MagicMock

from app.core.errors import AppError, app_error_handler


def test_app_error_handler_shape():
    req = MagicMock()
    req.state.request_id = "rid-test"

    resp = asyncio.run(app_error_handler(req, AppError("demo_code", "demo message", status_code=422)))

    assert resp.status_code == 422
    body = json.loads(resp.body.decode())
    assert body["code"] == "demo_code"
    assert body["message"] == "demo message"
    assert body["request_id"] == "rid-test"
