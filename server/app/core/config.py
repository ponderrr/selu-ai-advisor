# app/core/config.py

from pydantic_settings import BaseSettings
import logging

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    PROJECT_NAME: str = "SELU AI Advisor"
    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str 

    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "mistral" 
    OLLAMA_TIMEOUT: float = 60.0 

    REDIS_URL: str = "redis://localhost:6379/0" 

    class Config:
        env_file = ".env"

settings = Settings()