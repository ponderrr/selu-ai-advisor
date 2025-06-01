"""add w_number to users

Revision ID: 0cc14409b8a1
Revises: 262eb397c17b
Create Date: 2025-05-31 15:06:08.221466

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0cc14409b8a1'
down_revision: Union[str, None] = '262eb397c17b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
