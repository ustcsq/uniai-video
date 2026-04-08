from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.user import CreditsOut, UserOut, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserOut)
async def read_me(user: User = Depends(get_current_user)) -> User:
    return user


@router.put("/me", response_model=UserOut)
async def update_me(
    body: UserUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    data = body.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(user, k, v)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/me/credits", response_model=CreditsOut)
async def read_credits(user: User = Depends(get_current_user)) -> CreditsOut:
    return CreditsOut(balance=user.credits, items=[])
