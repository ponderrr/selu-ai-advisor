from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import logging

from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.ai_service import ollama_service

logger = logging.getLogger(__name__)

chat_router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    success: bool
    response_time: Optional[float] = None
    error: Optional[str] = None

@chat_router.post("/", response_model=ChatResponse)
async def chat_with_ai(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Main chat endpoint for AI academic advisor
    """
    # Check if AI service is available
    if not ollama_service.health_check():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is currently unavailable. Please try again later."
        )
    
    # Create system message for SELU academic context
    system_message = f"""You are an academic advisor AI for Southeastern Louisiana University (SELU) Computer Science department. 
    
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
    
    try:
        # Get AI response
        ai_result = await ollama_service.chat(
            prompt=chat_request.message,
            system_message=system_message
        )
        
        if ai_result["success"]:
            logger.info(f"AI chat successful for user {current_user.email}, response time: {ai_result.get('response_time')}s")
            return ChatResponse(
                response=ai_result["response"],
                success=True,
                response_time=ai_result.get("response_time")
            )
        else:
            logger.error(f"AI chat failed for user {current_user.email}: {ai_result.get('error')}")
            return ChatResponse(
                response="I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
                success=False,
                error=ai_result.get("error")
            )
            
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )

@chat_router.get("/health")
async def chat_health():
    """Check if AI service is available"""
    is_healthy = ollama_service.health_check()
    return {
        "status": "healthy" if is_healthy else "unhealthy",
        "service": "ollama",
        "model": "mistral" if is_healthy else None,
        "message": "AI service is ready" if is_healthy else "AI service is not available"
    }

@chat_router.get("/test")
async def test_ai_response():
    """Test endpoint for AI functionality (remove in production)"""
    test_result = await ollama_service.chat(
        prompt="Hello, this is a test. Please respond with a brief greeting.",
        system_message="You are a helpful AI assistant. Keep responses brief."
    )
    return test_result