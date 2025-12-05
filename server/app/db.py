# app/db.py
import asyncio
import logging
import asyncpg
from typing import Optional   # ← REQUIRED IMPORT

from .config import settings

logger = logging.getLogger("uvicorn.error")

_pool: Optional[asyncpg.pool.Pool] = None


async def _create_pool():
    """
    Create a global asyncpg connection pool.
    """
    global _pool
    if _pool:
        return _pool

    logger.info("Creating asyncpg pool...")

    _pool = await asyncpg.create_pool(
        dsn=settings.DATABASE_URL,
        min_size=settings.DB_POOL_MIN,
        max_size=settings.DB_POOL_MAX
    )

    logger.info("PostgreSQL pool created.")
    return _pool


async def get_pool():
    """Return the pool, creating it if needed."""
    return await _create_pool()


async def ensure_main_table():
    """
    Creates the expandable SQL table if it doesn't exist.
    """
    pool = await get_pool()

    async with pool.acquire() as conn:
        await conn.execute(f"""
        CREATE TABLE IF NOT EXISTS {settings.MAIN_TABLE_NAME} (
            id BIGSERIAL PRIMARY KEY,
            uploaded_at TIMESTAMPTZ DEFAULT now()
            -- dynamic columns will be added later during upload
        );
        """)

        logger.info(f"Ensured main table '{settings.MAIN_TABLE_NAME}' exists.")
