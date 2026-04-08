import asyncio
import logging
import time

import redis.asyncio as aioredis

from app.core.config import settings

log = logging.getLogger(__name__)

_client: aioredis.Redis | None = None
_mem_cache: dict[str, tuple[str, float]] = {}
_mem_lock = asyncio.Lock()


async def init_redis() -> None:
    global _client
    if not settings.redis_url:
        log.info("Redis skipped: REDIS_URL not set")
        return
    _client = aioredis.from_url(
        settings.redis_url,
        decode_responses=True,
    )


async def close_redis() -> None:
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None


async def redis_health() -> str:
    """ok | skipped | error"""
    if not settings.redis_url:
        return "skipped"
    if _client is None:
        return "error"
    try:
        pong = await _client.ping()
        return "ok" if pong else "error"
    except Exception:
        log.exception("Redis ping 失败")
        return "error"


async def cache_set(key: str, value: str, ttl_seconds: int) -> None:
    """无 Redis 时退化为进程内缓存（单进程开发可用）。"""
    if _client is not None:
        await _client.setex(key, ttl_seconds, value)
        return
    async with _mem_lock:
        _mem_cache[key] = (value, time.monotonic() + ttl_seconds)


async def cache_get(key: str) -> str | None:
    if _client is not None:
        return await _client.get(key)
    async with _mem_lock:
        item = _mem_cache.get(key)
        if not item:
            return None
        val, exp_mono = item
        if time.monotonic() > exp_mono:
            del _mem_cache[key]
            return None
        return val


async def cache_delete(key: str) -> None:
    if _client is not None:
        await _client.delete(key)
        return
    async with _mem_lock:
        _mem_cache.pop(key, None)
