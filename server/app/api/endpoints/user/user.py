# fastapi 
from fastapi import APIRouter, Depends, HTTPException, status # Import status
# sqlalchemy
from sqlalchemy.orm import Session

# import
from app.core.dependencies import get_db, oauth2_scheme 
from app.schemas.user import User, UserCreate, UserUpdate # Assuming these are your core User schemas
from app.api.endpoints.user import functions as user_functions # Assuming user_functions is correct

import logging # For the logger in get_my_profile
from app.models.user import User as UserModel # Alias to avoid conflict with app.schemas.user.User
from app.schemas.user_profile import UserProfileDetailedResponse
from app.services.user_profile_service import get_user_profile_detailed
# ---------------------------------------------

logger = logging.getLogger(__name__) # Initialize logger

user_module = APIRouter(prefix="/users", tags=["users"]) # Ensure prefix is /users

# --- NEW: GET /api/users/me/profile endpoint ---
@user_module.get("/me/profile", response_model=UserProfileDetailedResponse)
async def get_my_profile(
    current_user: UserModel = Depends(user_functions.get_current_user), # Use user_functions.get_current_user or direct get_current_user from app.core.security
    db: Session = Depends(get_db)
):
    """
    Get the complete profile of the authenticated user.
    """
    try:
        profile = await get_user_profile_detailed(db, current_user.id)
        return profile
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching detailed profile for user {current_user.id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not retrieve profile.")
# -------------------------------------------------


# create new user 
@user_module.post('/', response_model=User)
async def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    if not user.email.endswith("@selu.edu"):
        raise HTTPException(status_code=400, detail="Only @selu.edu email addresses are allowed")

    db_user = user_functions.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = user_functions.create_new_user(db, user)
    return new_user


# get all user 
@user_module.get('/', 
             response_model=list[User],
             # dependencies=[Depends(RoleChecker(['admin']))]
             )
async def read_all_user( skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return user_functions.read_all_user(db, skip, limit)

# get user by id 
@user_module.get('/{user_id}', 
             response_model=User,
             # dependencies=[Depends(RoleChecker(['admin']))]
             )
async def read_user_by_id( user_id: int, db: Session = Depends(get_db)):
    return user_functions.get_user_by_id(db, user_id)

# update user
@user_module.patch('/{user_id}', 
              response_model=User,
            #  dependencies=[Depends(RoleChecker(['admin']))]
              )
async def update_user( user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    print(f"Received data: {user.model_dump()}")
    return user_functions.update_user(db, user_id, user)

# delete user
@user_module.delete('/{user_id}', 
            # response_model=User,
            # dependencies=[Depends(RoleChecker(['admin']))]
                )
async def delete_user( user_id: int, db: Session = Depends(get_db)):
    return user_functions.delete_user(db, user_id)