# app/services/extractor.py
import pdfplumber
import re
from typing import Dict, Any, List
from ..utils import normalize_key
import logging

logger = logging.getLogger("uvicorn.error")

def find_key_values_from_text(text: str) -> Dict[str, str]:
    """Small regex-based KV extraction (keeps previous behavior)."""
    fields = {}
    m = re.search(r'(invoice\s*(?:no|number)?[:#]?\s*)([A-Za-z0-9\-/]+)', text, re.I)
    if m:
        fields['InvoiceNumber'] = m.group(2).strip()
    m = re.search(r'(date[:\s]*)(\d{1,2}[\/\-\.\s]\d{1,2}[\/\-\.\s]\d{2,4})', text, re.I)
    if m:
        fields['Date'] = m.group(2).strip()
    m = re.search(r'(total[:\s]*₹?\$?\s*)([0-9,]+(?:\.\d+)?)', text, re.I)
    if m:
        fields['Total'] = m.group(2).replace(',', '').strip()
    return fields

def parse_tables_from_pdf(path: str) -> List[Dict[str, Any]]:
    """
    Extract tables using pdfplumber.
    For each table return:
      - headers: raw header list
      - norm_headers: normalized header keys
      - rows: list[list] raw rows
      - rows_as_objects: list[dict] mapping normalized header -> cell
      - page: page number
    """
    tables = []
    try:
        with pdfplumber.open(path) as pdf:
            for i, page in enumerate(pdf.pages, start=1):
                page_tables = page.extract_tables()
                for t in page_tables:
                    if not t or len(t) == 0:
                        continue
                    # treat first row as header if it looks like header (strings)
                    raw_headers = t[0]
                    rows = t[1:] if len(t) > 1 else []

                    # Fallback: if header row contains mostly None or numeric values, treat no headers.
                    header_ok = any(isinstance(h, str) and h.strip() for h in raw_headers)
                    if not header_ok:
                        # generate synthetic headers c1..cn
                        col_count = max(len(r) for r in ([raw_headers] + rows))
                        raw_headers = [f"col_{i+1}" for i in range(col_count)]

                    # normalize headers
                    norm_headers = [normalize_key(str(h)) if h is not None and str(h).strip() != "" else f"col_{idx+1}"
                                    for idx, h in enumerate(raw_headers)]

                    # normalize duplicate norm headers by appending index
                    seen = {}
                    for idx, h in enumerate(norm_headers):
                        if h in seen:
                            seen[h] += 1
                            norm_headers[idx] = f"{h}_{seen[h]}"
                        else:
                            seen[h] = 1

                    # build rows_as_objects
                    rows_as_objects = []
                    for row in rows:
                        # ensure row length matches headers
                        row_cells = list(row) + [None] * (len(norm_headers) - len(row))
                        obj = {norm_headers[j]: (row_cells[j] if row_cells[j] is not None else "") for j in range(len(norm_headers))}
                        rows_as_objects.append(obj)

                    tables.append({
                        "page": i,
                        "headers": raw_headers,
                        "norm_headers": norm_headers,
                        "rows": rows,
                        "rows_as_objects": rows_as_objects
                    })
    except Exception as e:
        logger.error("Error parsing tables from PDF", exc_info=True)
        raise
    return tables

def run_extraction(path: str) -> Dict[str, Any]:
    """
    Extract text, fields, and tables. Return a dictionary:
      {
        raw_text: "...",
        tables: [ {page, headers, norm_headers, rows, rows_as_objects}, ... ],
        fields: {...},
        norm_fields: {...}
      }
    """
    raw_text = ""
    try:
        with pdfplumber.open(path) as pdf:
            for p in pdf.pages:
                text = p.extract_text() or ""
                raw_text += text + "\n"
    except Exception:
        # If opening/extracting fails, log and re-raise
        logger.exception("Failed to open or read PDF for text extraction")
        raise

    tables = parse_tables_from_pdf(path)
    fields = find_key_values_from_text(raw_text)
    norm = {normalize_key(k): v for k, v in fields.items()}

    return {
        "raw_text": raw_text,
        "tables": tables,
        "fields": fields,
        "norm_fields": norm
    }
