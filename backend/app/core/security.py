from datetime import datetime, timedelta, timezone

import jwt
from jwt.exceptions import InvalidTokenError

from app.core.config import settings


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(user_id: int) -> str:
    exp = _utc_now() + timedelta(minutes=settings.jwt_access_expire_minutes)
    payload = {"sub": str(user_id), "typ": "access", "exp": exp}
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def create_refresh_token(user_id: int) -> str:
    exp = _utc_now() + timedelta(days=settings.jwt_refresh_expire_days)
    payload = {"sub": str(user_id), "typ": "refresh", "exp": exp}
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])


def decode_token_safe(token: str) -> dict | None:
    try:
        return decode_token(token)
    except InvalidTokenError:
        return None
