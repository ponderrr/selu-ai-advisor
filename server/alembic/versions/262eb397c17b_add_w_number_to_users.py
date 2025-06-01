"""add w_number to users

Revision ID: 262eb397c17b
Revises: 5ac8ddbcbeeb
Create Date: 2025-05-31 15:02:07.493927

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '262eb397c17b'
down_revision: Union[str, None] = '5ac8ddbcbeeb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
