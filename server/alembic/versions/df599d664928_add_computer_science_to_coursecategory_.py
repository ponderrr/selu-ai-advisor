"""add Computer Science to coursecategory enum

Revision ID: df599d664928
Revises: a44e17055dba
Create Date: 2025-06-04 16:47:23.433829

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'df599d664928'
down_revision: Union[str, None] = 'a44e17055dba'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
