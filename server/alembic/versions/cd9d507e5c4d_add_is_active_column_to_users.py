"""add is_active column to users

Revision ID: cd9d507e5c4d
Revises: ed43a57078dc
Create Date: 2025-06-04 20:04:10.923694

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cd9d507e5c4d'
down_revision: Union[str, None] = 'ed43a57078dc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
    op.alter_column("users", "is_active", server_default=None)


def downgrade() -> None:
    pass
