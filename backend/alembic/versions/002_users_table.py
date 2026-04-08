"""users table

Revision ID: 002
Revises: 001
Create Date: 2026-04-09

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column("wechat_openid", sa.String(length=128), nullable=True),
        sa.Column("nickname", sa.String(length=50), nullable=True),
        sa.Column("avatar_url", sa.Text(), nullable=True),
        sa.Column("school", sa.String(length=100), nullable=True),
        sa.Column("major", sa.String(length=100), nullable=True),
        sa.Column("role", sa.String(length=20), server_default=sa.text("'user'"), nullable=False),
        sa.Column("credits", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("referral_code", sa.String(length=20), nullable=False),
        sa.Column("referred_by", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["referred_by"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("phone"),
        sa.UniqueConstraint("wechat_openid"),
        sa.UniqueConstraint("referral_code"),
    )


def downgrade() -> None:
    op.drop_table("users")
