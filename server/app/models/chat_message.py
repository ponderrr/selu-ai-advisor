from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid 

from app.core.database import Base 

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    session_id = Column(UUID(as_uuid=True), default=uuid.uuid4, nullable=False, index=True)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="chat_messages")

    def __repr__(self):
        return f"<ChatMessage(id={self.id}, user_id={self.user_id}, role='{self.role}', session_id='{self.session_id}')>"

