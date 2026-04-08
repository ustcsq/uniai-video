import random

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.core.config import settings
from app.core.errors import AppError
from app.core.security import create_access_token, create_refresh_token, decode_token_safe
from app.redis_client import cache_delete, cache_get, cache_set
from app.schemas.auth import RefreshIn, SmsLoginIn, SmsSendIn, TokenOut
from app.services.user_service import get_or_create_user_by_phone, get_user_by_id

router = APIRouter()


def _sms_key(phone: str) -> str:
    return f"sms:{phone}"


@router.post("/sms/send")
async def sms_send(body: SmsSendIn) -> dict:
    if settings.auth_dev_fixed_code:
        code = settings.auth_dev_fixed_code
    else:
        code = f"{random.randint(0, 999999):06d}"
    await cache_set(_sms_key(body.phone), code, settings.sms_code_ttl_seconds)
    out: dict = {"ok": True, "expires_in": settings.sms_code_ttl_seconds}
    if settings.sms_debug_return_code:
        out["debug_code"] = code
    return out


@router.post("/sms/login", response_model=TokenOut)
async def sms_login(body: SmsLoginIn, db: AsyncSession = Depends(get_db)) -> TokenOut:
    key = _sms_key(body.phone)
    stored = await cache_get(key)
    if stored is None or stored != body.code.strip():
        raise AppError("invalid_code", "验证码错误或已过期", status_code=400)
    await cache_delete(key)

    user = await get_or_create_user_by_phone(db, body.phone)
    await db.commit()
    await db.refresh(user)

    return TokenOut(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        expires_in=settings.jwt_access_expire_minutes * 60,
    )


@router.post("/refresh", response_model=TokenOut)
async def refresh_token(body: RefreshIn, db: AsyncSession = Depends(get_db)) -> TokenOut:
    payload = decode_token_safe(body.refresh_token.strip())
    if not payload or payload.get("typ") != "refresh":
        raise AppError("invalid_refresh", "刷新令牌无效或已过期", status_code=401)
    try:
        uid = int(payload["sub"])
    except (KeyError, TypeError, ValueError):
        raise AppError("invalid_refresh", "刷新令牌无效或已过期", status_code=401)

    user = await get_user_by_id(db, uid)
    if not user:
        raise AppError("invalid_refresh", "用户不存在", status_code=401)

    return TokenOut(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        expires_in=settings.jwt_access_expire_minutes * 60,
    )
