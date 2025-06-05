"""Initial schema setup

Revision ID: c56a02e164b2
Revises: cd9d507e5c4d
Create Date: 2025-06-05 13:06:07.302406

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c56a02e164b2'
down_revision: Union[str, None] = 'cd9d507e5c4d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
