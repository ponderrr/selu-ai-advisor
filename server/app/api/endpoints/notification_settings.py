from datetime import datetime
import re
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User as UserModel
from app.schemas.notification_settings import (
    NotificationSettingsResponse, 
    NotificationSettingsUpdate
)
from app.services.notification_settings_service import NotificationSettingsService

import logging

logger = logging.getLogger(__name__)

notification_module = APIRouter(tags=["notifications settings"])

@notification_module.get("/users/me/notification-settings", response_model=NotificationSettingsResponse)
def get_notification_settings(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> NotificationSettingsResponse:
    """
    Get current user's notification settings.
    Creates default settings if they don't exist.
    """
    try:
        service = NotificationSettingsService(db)
        settings = service.get_user_notification_settings(current_user.id)
        logger.info(f"Retrieved notification settings for user {current_user.id}")
        return settings
    except Exception as e:
        logger.error(f"Failed to fetch notification settings for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notification settings"
        )

@notification_module.put("/users/me/notification-settings", response_model=NotificationSettingsResponse)
def update_notification_settings(
    settings_update: NotificationSettingsUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> NotificationSettingsResponse:
    """
    Update current user's notification settings.
    Only updates provided fields.
    """
    try:
        service = NotificationSettingsService(db)
        updated_settings = service.update_notification_settings(
            current_user.id, 
            settings_update
        )
        logger.info(f"Updated notification settings for user {current_user.id}")
        return updated_settings
    except Exception as e:
        logger.error(f"Failed to update notification settings for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update notification settings"
        )

@notification_module.get("/users/me/notification-settings/check")
def check_notification_allowed(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Check if notifications are currently allowed based on quiet hours.
    Useful for other services to check before sending notifications.
    """
    try:
        service = NotificationSettingsService(db)
        allowed = service.should_send_notification(current_user.id)
        logger.debug(f"Notification check for user {current_user.id}: {'allowed' if allowed else 'blocked'}")
        return {
            "notification_allowed": allowed,
            "message": "Notifications allowed" if allowed else "Currently in quiet hours"
        }
    except Exception as e:
        logger.error(f"Failed to check notification status for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check notification status"
        )