# app/routes/upload.py
import os
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from uuid import uuid4
from typing import List, Set

from ..config import settings
from ..db import get_pool, ensure_main_table
from ..services.extractor import run_extraction

logger = logging.getLogger("uvicorn.error")
router = APIRouter(prefix="/api")

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


async def _get_table_columns(conn) -> List[str]:
    """Return list of column names for main table."""
    rows = await conn.fetch(
        """
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = $1
        """,
        settings.MAIN_TABLE_NAME
    )
    return [r["column_name"] for r in rows]


async def _add_column(conn, col_name: str):
    """Add a TEXT column if not exists."""
    await conn.execute(
        f'ALTER TABLE {settings.MAIN_TABLE_NAME} ADD COLUMN IF NOT EXISTS "{col_name}" TEXT;'
    )
    logger.info(f"[DB] Added new column -> {col_name}")


async def _drop_column(conn, col_name: str):
    """Drop a column if exists."""
    await conn.execute(
        f'ALTER TABLE {settings.MAIN_TABLE_NAME} DROP COLUMN IF EXISTS "{col_name}";'
    )
    logger.info(f"[DB] Dropped column -> {col_name}")


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    logger.info(f"[UPLOAD] File received: {getattr(file, 'filename', '')}")

    # Validate file
    if file.content_type != "application/pdf":
        logger.warning("[UPLOAD] Rejected: not a PDF")
        raise HTTPException(400, "Only PDF files are allowed")

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        logger.warning("[UPLOAD] File too large")
        raise HTTPException(413, "File too large")

    # Save file locally
    upload_id = uuid4().hex
    file_path = os.path.join(settings.UPLOAD_DIR, f"{upload_id}_{file.filename}")

    try:
        with open(file_path, "wb") as f:
            f.write(content)
        logger.info(f"[UPLOAD] Saved file at {file_path}")
    except Exception:
        logger.exception("[UPLOAD] Failed to save file")
        raise HTTPException(500, "Could not save file")

    # Extract tables from PDF (use only first one). See extractor for structure. :contentReference[oaicite:2]{index=2}
    try:
        extracted = run_extraction(file_path)
    except Exception:
        logger.exception("[EXTRACT] Extraction failed")
        raise HTTPException(500, "Failed to extract PDF")

    tables = extracted.get("tables", [])
    if not tables:
        logger.warning("[EXTRACT] No tables found")
        raise HTTPException(400, "No tables found in the PDF")

    # Only first table is valid per your requirement
    first_table = tables[0]
    columns = first_table.get("norm_headers", []) or []
    rows = first_table.get("rows_as_objects", []) or []

    logger.info(f"[EXTRACT] First table columns → {columns}")
    logger.info(f"[EXTRACT] Rows extracted → {len(rows)}")

    # DB operations: truncate table, drop old columns, add new columns, insert rows
    pool = await get_pool()
    async with pool.acquire() as conn:
        # ensure base table exists (id, uploaded_at)
        await ensure_main_table()

        # Get existing columns from DB
        existing_columns = await _get_table_columns(conn)
        logger.debug(f"[DB] Existing columns before changes: {existing_columns}")

        # Identify data columns (exclude id and uploaded_at)
        meta_cols = {"id", "uploaded_at"}
        existing_data_cols: Set[str] = set(existing_columns) - meta_cols
        new_cols_set: Set[str] = set(columns)

        # 1) Remove previous rows
        try:
            await conn.execute(f"TRUNCATE TABLE {settings.MAIN_TABLE_NAME};")
            logger.info(f"[DB] Truncated table {settings.MAIN_TABLE_NAME} (previous rows removed)")
        except Exception:
            logger.exception("[DB] Failed to truncate table")
            raise HTTPException(500, "Failed to reset table")

        # 2) Drop columns that are not in new set
        to_drop = existing_data_cols - new_cols_set
        if to_drop:
            logger.info(f"[DB] Columns to drop: {to_drop}")
            for col in to_drop:
                try:
                    await _drop_column(conn, col)
                except Exception:
                    logger.exception(f"[DB] Failed to drop column: {col}")
                    raise HTTPException(500, f"Failed to drop column: {col}")

        # 3) Add new columns that don't exist
        cols_after_drop = set(await _get_table_columns(conn))  # refresh after drops
        to_add = new_cols_set - cols_after_drop
        if to_add:
            logger.info(f"[DB] Columns to add: {to_add}")
            for col in to_add:
                try:
                    await _add_column(conn, col)
                except Exception:
                    logger.exception(f"[DB] Failed to add column: {col}")
                    raise HTTPException(500, f"Failed to add column: {col}")

        # 4) Insert rows (if no columns, nothing to insert)
        if columns and rows:
            cols_sql = ", ".join(f'"{c}"' for c in columns)
            placeholders = ", ".join(f"${i+1}" for i in range(len(columns)))
            insert_sql = f'INSERT INTO {settings.MAIN_TABLE_NAME} ({cols_sql}) VALUES ({placeholders});'

            try:
                for r in rows:
                    values = [r.get(c) for c in columns]
                    await conn.execute(insert_sql, *values)
                logger.info(f"[DB] Inserted {len(rows)} rows into {settings.MAIN_TABLE_NAME}")
            except Exception:
                logger.exception("[DB] Failed to insert rows")
                raise HTTPException(500, "Failed to insert rows into DB")
        else:
            logger.info("[DB] No columns or rows to insert (skipping insertion)")

    # Return only columns + rows (unchanged values as extracted)
    return {"columns": columns, "rows": rows}
