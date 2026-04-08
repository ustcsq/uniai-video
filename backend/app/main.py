import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.errors import AppError, app_error_handler
from app.core.logging_config import configure_logging
from app.db.session import engine
from app.redis_client import close_redis, init_redis


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging(settings.log_level)
    if "sqlite" in settings.database_url:
        from pathlib import Path

        Path("data").mkdir(parents=True, exist_ok=True)
    await init_redis()
    yield
    await close_redis()
    await engine.dispose()


app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    root_path=settings.root_path or "",
    lifespan=lifespan,
)

app.add_exception_handler(AppError, app_error_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    rid = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = rid
    response = await call_next(request)
    response.headers["X-Request-ID"] = rid
    return response


@app.get("/")
def root():
    return {"name": settings.api_title, "docs": "/docs", "api": "/api/v1"}


app.include_router(api_router, prefix="/api/v1")
