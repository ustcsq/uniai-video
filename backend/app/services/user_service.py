import secrets
import string

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def get_user_by_id(session: AsyncSession, user_id: int) -> User | None:
    r = await session.execute(select(User).where(User.id == user_id))
    return r.scalar_one_or_none()


async def get_user_by_phone(session: AsyncSession, phone: str) -> User | None:
    r = await session.execute(select(User).where(User.phone == phone))
    return r.scalar_one_or_none()


def _random_referral_code() -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(8))


async def ensure_unique_referral(session: AsyncSession) -> str:
    for _ in range(20):
        code = _random_referral_code()
        r = await session.execute(select(User.id).where(User.referral_code == code).limit(1))
        if r.first() is None:
            return code
    raise RuntimeError("无法生成唯一推广码")


async def get_or_create_user_by_phone(session: AsyncSession, phone: str) -> User:
    u = await get_user_by_phone(session, phone)
    if u:
        return u
    ref = await ensure_unique_referral(session)
    nickname = f"用户{phone[-4:]}"
    u = User(phone=phone, referral_code=ref, nickname=nickname)
    session.add(u)
    await session.flush()
    return u
