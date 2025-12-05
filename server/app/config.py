# app/config.py
from typing import Optional
try:
    from pydantic import BaseSettings
except Exception:
    from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str  # e.g. postgresql://user:pw@host:5432/db
    DB_POOL_MIN: int = 1
    DB_POOL_MAX: int = 10
    UPLOAD_DIR: str = "./data/uploads"
    MAX_UPLOAD_SIZE: int = 20 * 1024 * 1024  # 20 MB
    MAIN_TABLE_NAME: str = "main_table"  # single table to store all extracted rows

    class Config:
        env_file = ".env"

settings = Settings()
