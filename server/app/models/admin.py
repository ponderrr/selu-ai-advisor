from sqladmin import ModelView
from app.models.user import User


class UserAdmin(ModelView, model=User):
    column_list = [
        User.w_number,
        User.first_name,
        User.last_name,
        User.email,
        User.password,
        User.role,
    ]
