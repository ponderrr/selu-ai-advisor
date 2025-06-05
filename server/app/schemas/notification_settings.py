from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class NotificationSettingsBase(BaseModel):
    email_advising_reminders: bool = True
    email_course_updates: bool = True
    email_deadline_alerts: bool = True
    email_system_updates: bool = False
    email_newsletter: bool = False
    push_advising_reminders: bool = True
    push_course_updates: bool = True
    push_deadline_alerts: bool = True
    push_system_updates: bool = False
    sms_advising_reminders: bool = False
    sms_urgent_deadlines: bool = False
    notification_frequency: str = Field(default="daily", pattern="^(immediate|daily|weekly)$")
    quiet_hours_enabled: bool = False
    quiet_hours_start: str = Field(default="22:00", pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    quiet_hours_end: str = Field(default="08:00", pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    timezone: str = "America/Chicago"

class NotificationSettingsCreate(NotificationSettingsBase):
    pass

class NotificationSettingsUpdate(BaseModel):
    email_advising_reminders: Optional[bool] = None
    email_course_updates: Optional[bool] = None
    email_deadline_alerts: Optional[bool] = None
    email_system_updates: Optional[bool] = None
    email_newsletter: Optional[bool] = None
    push_advising_reminders: Optional[bool] = None
    push_course_updates: Optional[bool] = None
    push_deadline_alerts: Optional[bool] = None
    push_system_updates: Optional[bool] = None
    sms_advising_reminders: Optional[bool] = None
    sms_urgent_deadlines: Optional[bool] = None
    notification_frequency: Optional[str] = Field(None, pattern="^(immediate|daily|weekly)$")
    quiet_hours_enabled: Optional[bool] = None
    quiet_hours_start: Optional[str] = Field(None, pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    quiet_hours_end: Optional[str] = Field(None, pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    timezone: Optional[str] = None

class NotificationSettingsResponse(NotificationSettingsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True