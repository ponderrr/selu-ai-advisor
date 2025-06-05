from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database  import Base

class NotificationSettings(Base):
    __tablename__ = "notification_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    email_advising_reminders = Column(Boolean, default=True)
    email_course_updates = Column(Boolean, default=True)
    email_deadline_alerts = Column(Boolean, default=True)
    email_system_updates = Column(Boolean, default=False)
    email_newsletter = Column(Boolean, default=False)
    
    push_advising_reminders = Column(Boolean, default=True)
    push_course_updates = Column(Boolean, default=True)
    push_deadline_alerts = Column(Boolean, default=True)
    push_system_updates = Column(Boolean, default=False)
    
    sms_advising_reminders = Column(Boolean, default=False)
    sms_urgent_deadlines = Column(Boolean, default=False)
    
    notification_frequency = Column(String, default="daily")
    quiet_hours_enabled = Column(Boolean, default=False)
    quiet_hours_start = Column(String, default="22:00")
    quiet_hours_end = Column(String, default="08:00")
    timezone = Column(String, default="America/Chicago")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="notification_settings")