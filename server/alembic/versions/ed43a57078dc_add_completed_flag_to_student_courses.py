from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "ed43a57078dc"
down_revision: str | None = "12c13954e1c3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "student_courses",
        sa.Column(
            "completed",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
    # drop the default now that existing rows are populated
    op.alter_column("student_courses", "completed", server_default=None)


def downgrade() -> None:
    op.drop_column("student_courses", "completed")
