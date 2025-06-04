# app/schemas/chat.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID

class ChatMessageBase(BaseModel):
    """Base schema for chat messages."""
    session_id: UUID
    role: str 
    content: str

    class Config:
        from_attributes = True 

class ChatMessageCreate(BaseModel):
    """Schema for creating a new chat message (from user input)."""
    message: str
    session_id: Optional[UUID] = None 

class ChatMessageInDB(ChatMessageBase):
    """Schema for chat messages as retrieved from the database."""
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True 

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[UUID] = None