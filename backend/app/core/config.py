from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    api_title: str = "UniAI Video API"
    api_version: str = "0.1.0"
    debug: bool = False
    log_level: str = "INFO"

    # 逗号分隔；上云后改为 https://你的域名（勿写死 Windows 路径）
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # 反代在子路径时填 OpenAPI 用，如 /api（多数「路径转发」场景可留空）
    root_path: str = ""

    # 本地默认 SQLite（目录 data/ 在启动时创建）；Compose 下用 postgresql+asyncpg://...
    database_url: str = "sqlite+aiosqlite:///./data/dev.db"

    # 不配置则 health 中 redis 为 skipped；验证码等仍可用进程内内存缓存
    redis_url: str | None = None

    # JWT（生产务必改 jwt_secret）
    jwt_secret: str = "dev-only-change-me-use-openssl-rand-hex-32"
    jwt_access_expire_minutes: int = 120
    jwt_refresh_expire_days: int = 7
    sms_code_ttl_seconds: int = 300

    # 若设置：发验证码固定为该串（本地/单测）；生产勿配
    auth_dev_fixed_code: str | None = None
    # 为真时发码接口在 JSON 中返回 debug_code（仅配合本地调试，切勿上生产）
    sms_debug_return_code: bool = False

    @property
    def cors_origins_list(self) -> list[str]:
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]

    @field_validator("root_path")
    @classmethod
    def normalize_root_path(cls, v: str) -> str:
        v = (v or "").strip()
        if not v or v == "/":
            return ""
        v = v.rstrip("/")
        if not v.startswith("/"):
            v = "/" + v
        return v


settings = Settings()
