import re
from bson import ObjectId
from typing import Any, Dict

def oid_to_str(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert ObjectId fields named _id or id to strings in a shallow dict."""
    out = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            out[k] = str(v)
        else:
            out[k] = v
    return out

def normalize_key(k: str) -> str:
    """Basic normalization for keys to snake_case lowercase."""
    k = k.strip()
    k = re.sub(r'[^0-9a-zA-Z]+', '_', k)
    k = re.sub(r'__+', '_', k)
    return k.strip('_').lower()
