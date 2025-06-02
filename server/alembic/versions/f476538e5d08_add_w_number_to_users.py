"""add w_number to users

Revision ID: f476538e5d08
Revises: 0cc14409b8a1
Create Date: 2025-05-31 15:11:53.332438

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f476538e5d08'
down_revision: Union[str, None] = '0cc14409b8a1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
