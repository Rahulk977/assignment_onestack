from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
from datetime import datetime

class UploadCreateResponse(BaseModel):
    upload_id: str

class UploadStatus(BaseModel):
    upload_id: str
    filename: str
    status: str
    uploaded_at: datetime
    extracted_doc_id: Optional[str] = None
    error: Optional[str] = None

class DocumentResponse(BaseModel):
    id: str = Field(..., alias="_id")
    upload_id: str
    raw_text: str
    tables: Optional[List[Dict[str, Any]]] = None
    fields: Optional[Dict[str, Any]] = None
    norm_fields: Optional[Dict[str, Any]] = None
    created_at: datetime
