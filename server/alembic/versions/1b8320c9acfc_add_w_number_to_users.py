"""add w_number to users

Revision ID: 1b8320c9acfc
Revises: f476538e5d08
Create Date: 2025-05-31 15:13:59.064258

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1b8320c9acfc'
down_revision: Union[str, None] = 'f476538e5d08'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
