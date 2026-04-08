from fastapi import APIRouter, Depends, Response
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.redis_client import redis_health

router = APIRouter()


@router.get("/health")
async def health(response: Response, db: AsyncSession = Depends(get_db)):
    db_status = "ok"
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "error"

    redis_status = await redis_health()

    body = {
        "status": "ok",
        "service": "uniai-video-api",
        "database": db_status,
        "redis": redis_status,
    }

    if db_status != "ok":
        body["status"] = "degraded"
        response.status_code = 503

    return body
