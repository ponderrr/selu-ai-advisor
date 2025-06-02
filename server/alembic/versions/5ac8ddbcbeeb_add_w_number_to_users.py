"""add w_number to users

Revision ID: 5ac8ddbcbeeb
Revises: 67338b1c3be9
Create Date: 2025-05-31 15:01:07.467550

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5ac8ddbcbeeb'
down_revision: Union[str, None] = '67338b1c3be9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
