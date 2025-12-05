# app/main.py
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import logging

from .config import settings
from .db import _create_pool, ensure_main_table  # import create function
from .routes import upload, documents

logger = logging.getLogger("uvicorn.error")

app = FastAPI(title="PDF Extractor API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(documents.router)

@app.on_event("startup")
async def startup():
    # create the pool and ensure main table
    await _create_pool()
    await ensure_main_table()
    logger.info("Startup complete: DB pool created and main table ensured.")

@app.get("/")
def root():
    return {"service": "pdf-extractor", "status": "ok"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
