"""add completed flag to student_courses

Revision ID: 37c14ce0039d
Revises: c4458146180c
Create Date: 2025-06-04 17:40:07.796776

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '37c14ce0039d'
down_revision: Union[str, None] = 'c4458146180c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
