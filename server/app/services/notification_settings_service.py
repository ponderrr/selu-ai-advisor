from datetime import datetime, time, timedelta
from typing import Optional
from sqlalchemy.orm import Session

from app.models.notification_settings import NotificationSettings
from app.schemas.notification_settings import NotificationSettingsUpdate

try:
    from zoneinfo import ZoneInfo
except ImportError:
    ZoneInfo = None

import logging

logger = logging.getLogger(__name__)

class NotificationSettingsService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_notification_settings(self, user_id: int) -> Optional[NotificationSettings]:
        """Get notification settings for a user, create default if not exists"""
        settings = self.db.query(NotificationSettings).filter(
            NotificationSettings.user_id == user_id
        ).first()
        
        if not settings:
            settings = self.create_default_settings(user_id)
            logger.info(f"Created default notification settings for user {user_id}")
        
        return settings
    
    def create_default_settings(self, user_id: int) -> NotificationSettings:
        """Create default notification settings for a user"""
        default_settings = NotificationSettings(user_id=user_id)
        self.db.add(default_settings)
        self.db.commit()
        self.db.refresh(default_settings)
        return default_settings
    
    def update_notification_settings(
        self, 
        user_id: int, 
        settings_update: NotificationSettingsUpdate
    ) -> NotificationSettings:
        """Update notification settings for a user"""
        settings = self.get_user_notification_settings(user_id)
        
        update_data = settings_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(settings, field, value)
        
        self.db.commit()
        self.db.refresh(settings)
        logger.info(f"Updated notification settings for user {user_id}")
        return settings
    
    def should_send_notification(
        self, 
        user_id: int, 
        current_time: Optional[datetime] = None
    ) -> bool:
        """Check if notifications should be sent based on quiet hours"""
        settings = self.get_user_notification_settings(user_id)
        
        if not settings.quiet_hours_enabled:
            return True
        
        if current_time is None:
            current_time = datetime.now()
        
        if ZoneInfo:
            try:
                user_tz = ZoneInfo(settings.timezone)
                user_time = current_time.astimezone(user_tz)
            except Exception as e:
                logger.warning(f"Invalid timezone {settings.timezone} for user {user_id}: {e}")
                user_time = current_time
        else:
            if settings.timezone == "America/Chicago":
                cst_offset = timedelta(hours=-6)  
                user_time = current_time + cst_offset
            else:
                user_time = current_time
        
        current_time_only = user_time.time()
        
        try:
            start_time = time.fromisoformat(settings.quiet_hours_start)
            end_time = time.fromisoformat(settings.quiet_hours_end)
        except ValueError as e:
            logger.warning(f"Invalid quiet hours format for user {user_id}: {e}")
            return True
        
        if start_time > end_time:
            return not (current_time_only >= start_time or current_time_only <= end_time)
        
        return not (start_time <= current_time_only <= end_time)
