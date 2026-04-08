"""路由依赖（数据库会话、当前用户）。"""

from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError
from app.core.security import decode_token_safe
from app.db.session import get_db
from app.models.user import User
from app.services.user_service import get_user_by_id

__all__ = ["get_db", "get_current_user"]

_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    if creds is None or not creds.credentials:
        raise AppError("unauthorized", "未登录或缺少 Token", status_code=401)
    payload = decode_token_safe(creds.credentials)
    if not payload or payload.get("typ") != "access":
        raise AppError("unauthorized", "无效或过期的访问令牌", status_code=401)
    try:
        uid = int(payload["sub"])
    except (KeyError, TypeError, ValueError):
        raise AppError("unauthorized", "无效或过期的访问令牌", status_code=401)

    user = await get_user_by_id(db, uid)
    if not user:
        raise AppError("unauthorized", "用户不存在", status_code=401)
    return user
