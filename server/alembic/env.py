# server/alembic/env.py

from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

from app.core.database import Base

# --- Ensure ALL your models are imported here so Base.metadata can discover them ---
from app.models import user, course, degree_program, prerequisite, user_profile 
from app.models import student_course 
from app.models import chat_message 
# Uncomment and add these new models:
from app.models import major, concentration, academic_info 
# If you add any more models (e.g., sessions, login_history, security_settings etc.),
# remember to add them here as well.
# from app.models import sessions, login_history, user_security_settings, privacy_settings, data_export_requests, ai_preferences, notification_settings
# ----------------------------------------------------------------------------------

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()