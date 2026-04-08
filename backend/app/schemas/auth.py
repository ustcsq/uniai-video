from pydantic import BaseModel, Field


class SmsSendIn(BaseModel):
    phone: str = Field(..., pattern=r"^1[3-9]\d{9}$")


class SmsLoginIn(BaseModel):
    phone: str = Field(..., pattern=r"^1[3-9]\d{9}$")
    code: str = Field(..., min_length=4, max_length=10)


class RefreshIn(BaseModel):
    refresh_token: str = Field(..., min_length=10)


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
