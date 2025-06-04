from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from uuid import UUID, uuid4

from app.models.chat_message import ChatMessage
from app.schemas.chat import ChatMessageBase  

# Define a Pydantic schema for storing/retrieving chat messages
# app/schemas/chat.py
# class ChatMessageBase(BaseModel):
#     session_id: UUID
#     role: str
#     content: str
#     timestamp: datetime # for retrieved messages

async def create_chat_message(
    db: Session, user_id: int, session_id: UUID, role: str, content: str
) -> ChatMessage:
    """Saves a new chat message to the database."""
    db_message = ChatMessage(
        user_id=user_id,
        session_id=session_id,
        role=role,
        content=content
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

async def get_chat_history(
    db: Session, user_id: int, session_id: UUID, limit: int = 100
) -> List[Dict[str, str]]:
    """
    Retrieves the last N messages for a given user and session,
    formatted for the AI model (role, content).
    """
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == user_id,
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.timestamp.asc()).limit(limit).all()

    formatted_messages = [
        {"role": msg.role, "content": msg.content}
        for msg in messages
    ]
    return formatted_messages

async def get_or_create_session_id(
    db: Session, user_id: int, provided_session_id: Optional[UUID] = None
) -> UUID:
    """
    Gets the latest session ID for a user, or creates a new one if none provided
    or no history exists for the provided ID.
    """
    if provided_session_id:
        existing_session = db.query(ChatMessage).filter(
            ChatMessage.user_id == user_id,
            ChatMessage.session_id == provided_session_id
        ).first()
        if existing_session:
            return provided_session_id

    return uuid4()