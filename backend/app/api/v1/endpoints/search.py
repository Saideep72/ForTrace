from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from pydantic import BaseModel
import logging
from supabase import create_client
from app.core.config import settings
from app.services.embedding_service import get_embedding

logger = logging.getLogger("fortrace.search")
router = APIRouter()

# Initialize Supabase client
db = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

class SearchResult(BaseModel):
    embedding_id: str
    doc_id: str
    chunk_index: int
    chunk_text: str
    chunk_metadata: dict
    similarity: float

@router.post("/semantic", response_model=List[SearchResult])
def semantic_search(
    query: str = Query(..., description="The query to search for"),
    uat: Optional[str] = Query(None, description="Optional UAT asset tag to filter results"),
    threshold: float = Query(0.0, description="Minimum cosine similarity threshold (0.0 to 1.0)"),
    limit: int = Query(5, description="Maximum number of match results to return")
):
    """
    Performs a semantic similarity search using pgvector and cosine distance in Supabase.
    """
    if not query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query cannot be empty."
        )

    try:
        # Convert query to its 1024-dimensional embedding vector
        query_vector = get_embedding(query)
    except Exception as e:
        logger.error(f"Failed to generate query embedding: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize query embedding."
        )

    try:
        # Call supabase match_embeddings RPC
        params = {
            "query_embedding": query_vector,
            "match_threshold": threshold,
            "match_count": limit,
            "filter_uat": uat
        }
        res = db.rpc("match_embeddings", params).execute()
        return res.data
    except Exception as e:
        logger.error(f"Supabase RPC match_embeddings failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Semantic similarity search database error: {str(e)}"
        )
