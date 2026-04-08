from typing import Any

from fastapi import Request, status
from fastapi.responses import JSONResponse


class AppError(Exception):
    """业务/可预期错误，映射为统一 JSON 结构。"""

    def __init__(
        self,
        code: str,
        message: str,
        *,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: dict[str, Any] | None = None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}


def _payload(request: Request, code: str, message: str, **extra: Any) -> dict[str, Any]:
    rid = getattr(request.state, "request_id", None)
    body: dict[str, Any] = {"code": code, "message": message}
    if rid:
        body["request_id"] = rid
    body.update(extra)
    return body


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=_payload(
            request,
            exc.code,
            exc.message,
            **({"details": exc.details} if exc.details else {}),
        ),
    )
