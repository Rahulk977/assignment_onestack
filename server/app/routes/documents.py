# app/routes/documents.py
from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from ..db import get_pool
from ..config import settings

router = APIRouter(prefix="/api/v1")

@router.get("/data")
async def get_data(limit: int = 50, offset: int = 0, columns: Optional[str] = None):
    """
    columns: comma-separated list of columns (normalized names). If omitted, returns all columns.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        # sanitize columns if provided
        if columns:
            cols = [c.strip() for c in columns.split(",") if c.strip()]
            # ensure col names are available in table
            rows = await conn.fetch(
                """
                SELECT column_name FROM information_schema.columns WHERE table_name = $1
                """,
                settings.MAIN_TABLE_NAME
            )
            existing = {r["column_name"] for r in rows}
            for c in cols:
                if c not in existing:
                    raise HTTPException(status_code=400, detail=f"Unknown column: {c}")
            cols_sql = ', '.join(f'"{c}"' for c in cols)
        else:
            cols_sql = '*'
        query = f'SELECT {cols_sql} FROM {settings.MAIN_TABLE_NAME} ORDER BY id DESC LIMIT $1 OFFSET $2;'
        result = await conn.fetch(query, limit, offset)
        # convert Record to dicts
        return [dict(r) for r in result]

@router.get("/analyze")
async def analyze(column: str):
    """
    Simple aggregate on a column (must be numeric or castable).
    Returns count, sum, avg, min, max.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        # Ensure column exists
        rows = await conn.fetch(
            "SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2",
            settings.MAIN_TABLE_NAME, column
        )
        if not rows:
            raise HTTPException(status_code=400, detail="Column not found")
        # Perform numeric aggregates; treat values by casting to numeric if possible, else return nulls
        sql = f"""
        SELECT
            COUNT(1) as count,
            SUM(NULLIF(REGEXP_REPLACE("{column}", '[,]', '', 'g')::numeric, '' )) as sum,
            AVG(NULLIF(REGEXP_REPLACE("{column}", '[,]', '', 'g')::numeric, '' )) as avg,
            MIN(NULLIF(REGEXP_REPLACE("{column}", '[,]', '', 'g')::numeric, '' )) as min,
            MAX(NULLIF(REGEXP_REPLACE("{column}", '[,]', '', 'g')::numeric, '' )) as max
        FROM {settings.MAIN_TABLE_NAME}
        WHERE "{column}" ~ '^[0-9,\\.]+$'  -- only numeric-ish rows
        """
        res = await conn.fetchrow(sql)
        return dict(res)
