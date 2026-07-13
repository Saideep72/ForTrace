from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.core.database import get_db
from app.core.security import get_current_user

router = APIRouter()

@router.get("/document/{doc_id}", status_code=status.HTTP_200_OK)
async def get_document_entities(
    doc_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Retrieves all named entities extracted for a specific document,
    ordered by their character position (start_char).
    """
    try:
        # Verify document exists
        doc_res = db.table("documents").select("doc_id").eq("doc_id", doc_id).eq("is_active", True).execute()
        if not doc_res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document with ID '{doc_id}' not found."
            )

        entities_res = db.table("extracted_entities") \
            .select("*") \
            .eq("doc_id", doc_id) \
            .order("start_char", desc=False) \
            .execute()

        return entities_res.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch document entities: {str(e)}"
        )

@router.get("/asset/{uat}", status_code=status.HTTP_200_OK)
async def get_asset_entities(
    uat: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Retrieves all named entities extracted for a specific asset UAT code.
    Finds all active documents linked to this asset and aggregates their entities.
    """
    try:
        # 1. Fetch active documents associated with the asset
        doc_res = db.table("documents") \
            .select("doc_id, title") \
            .eq("uat", uat) \
            .eq("is_active", True) \
            .execute()
        
        if not doc_res.data:
            return []

        doc_ids = [doc["doc_id"] for doc in doc_res.data]
        doc_title_map = {doc["doc_id"]: doc["title"] for doc in doc_res.data}

        # 2. Fetch entities for these document IDs
        entities_res = db.table("extracted_entities") \
            .select("*") \
            .in_("doc_id", doc_ids) \
            .order("created_at", desc=True) \
            .execute()

        # 3. Add document titles to metadata response for premium UI display
        results = []
        for ent in entities_res.data:
            ent["document_title"] = doc_title_map.get(ent["doc_id"], "N/A")
            results.append(ent)

        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch asset entities: {str(e)}"
        )
