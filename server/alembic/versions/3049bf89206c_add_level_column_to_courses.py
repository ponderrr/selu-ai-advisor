"""add level column to courses

Revision ID: 3049bf89206c
Revises: 8a0a6bbae3b5
Create Date: 2025-06-04 17:14:31.592253

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3049bf89206c'
down_revision: Union[str, None] = '8a0a6bbae3b5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
