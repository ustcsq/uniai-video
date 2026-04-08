from pydantic import BaseModel, ConfigDict, Field


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    phone: str | None
    nickname: str | None
    avatar_url: str | None
    school: str | None
    major: str | None
    role: str
    credits: int
    referral_code: str


class UserUpdate(BaseModel):
    nickname: str | None = Field(None, max_length=50)
    avatar_url: str | None = None
    school: str | None = Field(None, max_length=100)
    major: str | None = Field(None, max_length=100)


class CreditItemOut(BaseModel):
    """阶段 2 再实现流水；此处仅占位结构。"""

    id: int
    desc: str
    amount: int
    time: str


class CreditsOut(BaseModel):
    balance: int
    items: list[CreditItemOut] = Field(default_factory=list)
