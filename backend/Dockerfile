# 与 environment.yml 中 pip 依赖版本保持一致
FROM python:3.12-slim-bookworm

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN pip install --no-cache-dir \
    "fastapi>=0.115.0" \
    "uvicorn[standard]>=0.32.0" \
    "pydantic-settings>=2.6.0" \
    "sqlalchemy[asyncio]>=2.0.36" \
    "asyncpg>=0.30.0" \
    "aiosqlite>=0.20.0" \
    "alembic>=1.14.0" \
    "redis>=5.0.0" \
    "pytest>=8.0.0" \
    "pytest-asyncio>=0.24.0" \
    "httpx>=0.27.0" \
    "PyJWT>=2.8.0"

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
