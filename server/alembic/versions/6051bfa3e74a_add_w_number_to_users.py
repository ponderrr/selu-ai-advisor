"""add w_number to users

Revision ID: 6051bfa3e74a
Revises: d3a9743987c8
Create Date: 2025-05-31 14:59:50.307097

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6051bfa3e74a'
down_revision: Union[str, None] = 'd3a9743987c8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
