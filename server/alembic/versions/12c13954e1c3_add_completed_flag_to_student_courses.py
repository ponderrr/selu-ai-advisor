"""add completed flag to student_courses

Revision ID: 12c13954e1c3
Revises: 37c14ce0039d
Create Date: 2025-06-04 17:42:24.008784

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '12c13954e1c3'
down_revision: Union[str, None] = '37c14ce0039d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
