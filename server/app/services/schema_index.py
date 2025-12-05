from typing import Dict, Any
from ..db import db
from bson import ObjectId

async def update_schema_index(norm_fields: Dict[str, Any]):
    """
    Maintains a single document 'schema_index' with keys -> count and samples.
    Simple incremental update.
    """
    if not norm_fields:
        return
    updates = {}
    for k, v in norm_fields.items():
        updates[f"keys.{k}.count"] = 1
        # store a sample value if not present
        updates.setdefault(f"keys.{k}.sample", v)

    # We can't use an atomic loop to increment and set sample easily
    # We'll update counts with $inc and set sample with $setOnInsert logic per key.
    # Simpler approach: do one $inc per key and $set for sample if not exists.
    inc = {f"keys.{k}.count": 1 for k in norm_fields.keys()}
    set_on_insert = {f"keys.{k}.sample": v for k, v in norm_fields.items()}
    print("Commented code hetre")
    # await db.schema_index.update_one(
    #     {"_id": "global_schema"},
    #     {"$inc": inc, "$setOnInsert": set_on_insert, "$set": {"last_updated": __import__('datetime').datetime.utcnow()}},
    #     upsert=True
    # )
