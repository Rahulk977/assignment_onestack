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

# Replace your analyze route with this exact code

@router.get("/analyze")
async def analyze(column: str = Query(..., min_length=1)):
    """
    Numeric aggregates for a column: count, sum, avg, min, max.
    This version only casts values to numeric AFTER removing commas and
    ensuring the cleaned value matches a numeric pattern — avoids casting ''
    or non-numeric text which caused the InvalidTextRepresentationError.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        # validate column existence
        col_check = await conn.fetchrow(
            "SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2",
            settings.MAIN_TABLE_NAME, column
        )
        if not col_check:
            raise HTTPException(status_code=400, detail="Column not found")

        try:
            # Remove commas, then only cast those rows where the cleaned value looks numeric.
            # The regex used (after cleanup) matches integers or decimals, e.g. 123 or 123.45
            q = f"""
            SELECT
                COUNT(1) FILTER (WHERE "{column}" IS NOT NULL AND TRIM("{column}") <> '') AS count_total,
                SUM( (REGEXP_REPLACE("{column}", '[,]', '', 'g'))::numeric )
                    FILTER (WHERE REGEXP_REPLACE("{column}", '[,]', '', 'g') ~ '^[0-9]+(\\.[0-9]+)?$') AS sum,
                AVG( (REGEXP_REPLACE("{column}", '[,]', '', 'g'))::numeric )
                    FILTER (WHERE REGEXP_REPLACE("{column}", '[,]', '', 'g') ~ '^[0-9]+(\\.[0-9]+)?$') AS avg,
                MIN( (REGEXP_REPLACE("{column}", '[,]', '', 'g'))::numeric )
                    FILTER (WHERE REGEXP_REPLACE("{column}", '[,]', '', 'g') ~ '^[0-9]+(\\.[0-9]+)?$') AS min,
                MAX( (REGEXP_REPLACE("{column}", '[,]', '', 'g'))::numeric )
                    FILTER (WHERE REGEXP_REPLACE("{column}", '[,]', '', 'g') ~ '^[0-9]+(\\.[0-9]+)?$') AS max
            FROM {settings.MAIN_TABLE_NAME};
            """
            row = await conn.fetchrow(q)

            # If no result, return safe defaults
            if not row:
                return {"column": column, "count": 0, "sum": None, "avg": None, "min": None, "max": None}

            def _to_num(x):
                if x is None:
                    return None
                try:
                    return float(x)
                except Exception:
                    return x

            return {
                "column": column,
                "count": int(row["count_total"] or 0),
                "sum": _to_num(row["sum"]),
                "avg": _to_num(row["avg"]),
                "min": _to_num(row["min"]),
                "max": _to_num(row["max"]),
            }
        except Exception as e:
            logger.exception("Analyze failed")
            # Return a clear error to the client
            raise HTTPException(status_code=500, detail=f"Analyze failed: {e}")
