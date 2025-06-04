"""add level and timestamp cols to courses

Revision ID: f9fc17d8f896
Revises: 3049bf89206c
Create Date: 2025-06-04 17:18:56.046628

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f9fc17d8f896'
down_revision: Union[str, None] = '3049bf89206c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
