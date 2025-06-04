"""add COMPUTER_SCIENCE to coursecategory enum

Revision ID: 8a0a6bbae3b5
Revises: df599d664928
Create Date: 2025-06-04 16:55:08.098829

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8a0a6bbae3b5'
down_revision: Union[str, None] = 'df599d664928'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
