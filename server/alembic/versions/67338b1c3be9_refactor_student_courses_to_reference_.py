"""refactor student_courses to reference users

Revision ID: 67338b1c3be9
Revises: 6051bfa3e74a
Create Date: 2025-05-31 15:00:17.088041

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '67338b1c3be9'
down_revision: Union[str, None] = '6051bfa3e74a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
