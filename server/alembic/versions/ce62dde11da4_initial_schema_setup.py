"""Initial schema setup

Revision ID: ce62dde11da4
Revises: 2df14ce67b36
Create Date: 2025-06-04 16:40:42.401116

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ce62dde11da4'
down_revision: Union[str, None] = '2df14ce67b36'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
