"""create user_sessions table

Revision ID: 6df19f2bb175
Revises: 786c508cdb34
Create Date: 2025-06-11 20:47:11.430366

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6df19f2bb175'
down_revision: Union[str, None] = '786c508cdb34'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        'user_sessions',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, nullable=False),
        sa.Column('refresh_token', sa.String, nullable=False),
        sa.Column('device_info', sa.String, nullable=True),
        sa.Column('ip_address', sa.String, nullable=True),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('last_activity', sa.DateTime, server_default=sa.func.now()),
    )

def downgrade():
    op.drop_table('user_sessions')
