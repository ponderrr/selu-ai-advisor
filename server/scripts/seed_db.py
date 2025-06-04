# server/scripts/seed_db.py
import asyncio
from sqlalchemy.orm import Session
from app.db.init_db import init_db # Import the init_db function
from app.core.dependencies import get_db # To get a DB session
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def main():
    logger.info("Starting database seeding...")
    db: Session = next(get_db()) 
    try:
        await init_db(db)
    except Exception as e:
        logger.error(f"An error occurred during database seeding: {e}", exc_info=True)
    finally:
        db.close()
    logger.info("Database seeding finished.")

if __name__ == "__main__":
    asyncio.run(main())