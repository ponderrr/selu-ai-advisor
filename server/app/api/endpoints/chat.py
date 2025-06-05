from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict
import logging
import asyncio
from uuid import UUID, uuid4 

from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.ai_service import ollama_service
from app.services.chat_history_service import (
    create_chat_message,
    get_chat_history,
    get_or_create_session_id
)
from fastapi_limiter.depends import RateLimiter 


logger = logging.getLogger(__name__)

chat_router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[UUID] = None 

@chat_router.post(
    "/", 
    response_class=StreamingResponse,
    dependencies=[Depends(RateLimiter(times=5, seconds=60))]
)
async def chat_with_ai(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Main chat endpoint for AI academic advisor, now with streaming and history.
    """
    if not await ollama_service.health_check(): 
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is currently unavailable. Please try again later."
        )
    
    current_session_id = await get_or_create_session_id(
        db, current_user.id, chat_request.session_id
    )

    await create_chat_message( 
        db, current_user.id, current_session_id, "user", chat_request.message
    )

    history_messages = await get_chat_history(
        db, current_user.id, current_session_id, limit=50
    )

    system_message_content = f"""You are an academic advisor AI for Southeastern Louisiana University (SELU) Computer Science department. 
    You are helping {current_user.first_name or 'a student'} with academic planning and course guidance.
    Your role is to help with:
    - Course planning and scheduling advice
    - Degree requirements and prerequisites  
    - Academic policies and procedures
    - Study strategies and academic success tips
    - General computer science career guidance
    Be helpful, encouraging, and professional. If you don't know something specific about SELU's current policies or course offerings, 
    acknowledge this and suggest they contact their human advisor or check the official SELU catalog.
    Keep responses concise but helpful - aim for 2-3 paragraphs unless more detail is specifically requested."""
    
    messages: List[Dict[str, str]] = [
        {"role": "system", "content": system_message_content},
    ]
    messages.extend(history_messages)
    async def stream_and_save_response():
        full_ai_response_content = ""
        try:
            response_generator = ollama_service.chat_stream(
                messages=messages
            )
            
            async for chunk in response_generator:
                if chunk.startswith("ERROR:"): 
                    logger.error(f"AI service error during stream: {chunk}")
                    yield f"AI_ERROR: {chunk}"
                    break
                full_ai_response_content += chunk
                yield chunk
            
        except Exception as e:
            logger.error(f"Error during AI streaming or response accumulation: {str(e)}")
            yield f"AI_ERROR: An unexpected error occurred: {str(e)}"
        finally:
            if full_ai_response_content:
                try:
                    await create_chat_message(
                        db, current_user.id, current_session_id, "ai", full_ai_response_content
                    )
                    logger.info(f"AI response saved for user {current_user.id}, session {current_session_id}")
                except Exception as db_e:
                    logger.error(f"Failed to save AI response to DB: {db_e}")

    return StreamingResponse(stream_and_save_response(), media_type="text/event-stream")

@chat_router.get("/health")
async def chat_health():
    """Check if AI service is available"""
    is_healthy = await ollama_service.health_check() 
    return {
        "status": "healthy" if is_healthy else "unhealthy",
        "service": "ollama",
        "model": ollama_service.model if is_healthy else None, 
        "message": "AI service is ready" if is_healthy else "AI service is not available"
    }

@chat_router.get("/test")
async def test_ai_response(
    current_user: User = Depends(get_current_user)
):
    """Test endpoint for AI functionality (remove in production)"""
    test_message_parts = []
    
    test_messages: List[Dict[str, str]] = [
        {"role": "system", "content": "You are a helpful AI assistant. Keep responses brief."},
        {"role": "user", "content": "Hello, this is a test. Please respond with a brief greeting."}
    ]

    async for part in ollama_service.chat_stream(
        messages=test_messages
    ):
        test_message_parts.append(part)
    
    return {"response": "".join(test_message_parts), "success": True}