# fastapi
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.core.modules import init_routers, make_middleware, router
import logging 
import os

from app.core.config import settings 
from fastapi_limiter import FastAPILimiter
import redis.asyncio as redis 

logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    app_ = FastAPI(
        title="Swagger",
        description="Hello World",
        version="1.0.0",
        middleware=make_middleware(),
    )
    
    # Create static directory if it doesn't exist
    os.makedirs("static", exist_ok=True)
    
    # Mount static files
    app_.mount("/api/placeholder", StaticFiles(directory="static"), name="placeholder")
    
    init_routers(app_=app_)
    return app_

app = create_app()

@app.on_event("startup")
async def startup_event():
    try:
        redis_connection = redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)
        await FastAPILimiter.init(redis_connection)
        logger.info("FastAPI-Limiter initialized with Redis.")
    except Exception as e:
        logger.error(f"Failed to initialize FastAPI-Limiter: {e}")
