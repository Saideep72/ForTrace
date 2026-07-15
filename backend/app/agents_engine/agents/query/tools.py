"""
Query Agent Tools — live Supabase integrations.

These tools are called by gather_search_context() in core/retrieval.py
to assemble real context before passing it to the LLM.
"""

import os
import re
import logging
from pathlib import Path
from typing import List, Dict, Any

from dotenv import load_dotenv
from supabase import create_client, Client

logger = logging.getLogger("forttrace.agent_tools")

# ---------------------------------------------------------------------------
# Bootstrap: load env vars and create a Supabase client
# ---------------------------------------------------------------------------
# Walk up from this file to find the backend .env
_HERE = Path(__file__).resolve()
_BACKEND_ENV = _HERE.parents[5] / "backend" / ".env"
if _BACKEND_ENV.exists():
    load_dotenv(dotenv_path=_BACKEND_ENV)
else:
    # Fallback: load from current dir or system env
    load_dotenv()

_SUPABASE_URL = os.getenv("SUPABASE_URL", "")
_SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")

_db: Client | None = None

def _get_db() -> Client:
    global _db
    if _db is None:
        if not _SUPABASE_URL or not _SUPABASE_KEY:
            raise RuntimeError("Supabase credentials not found in environment.")
        _db = create_client(_SUPABASE_URL, _SUPABASE_KEY)
        logger.info("Supabase client initialized successfully for agent tools.")
    return _db


# ---------------------------------------------------------------------------
# Helper: extract equipment tag hints from free-text query
# ---------------------------------------------------------------------------
_TAG_RE = re.compile(
    r"\b([A-Z]{1,4}-\d{3}(?:-\d{3})?|Pump\s+[A-Z]{1,4}\d{3}|"
    r"Boiler\s+[A-Z]\d{3}|Reactor\s+[A-Z]-\d{3}|"
    r"[BCEFGHIJKLMPQRSTVWX][A-Z]?-?\d{3})\b",
    re.IGNORECASE,
)

def _extract_tag_hints(query: str) -> List[str]:
    """Return a list of candidate equipment tag strings found in the query."""
    return [m.group(0).upper().strip() for m in _TAG_RE.finditer(query)]


# ---------------------------------------------------------------------------
# 1. SQL Search — assets + alarm_history tables
# ---------------------------------------------------------------------------
def search_sql(query: str) -> List[Dict[str, Any]]:
    """
    Searches the assets and alarm_history tables for equipment mentioned in
    the query. Returns live Supabase records.
    """
    results: List[Dict[str, Any]] = []
    try:
        db = _get_db()
        tag_hints = _extract_tag_hints(query)

        if tag_hints:
            # Search assets table by equipment_tag (ilike)
            for tag in tag_hints[:3]:
                asset_res = db.table("assets") \
                    .select("uat, equipment_tag, equipment_type, status, criticality_rating, manufacturer, location") \
                    .ilike("equipment_tag", f"%{tag}%") \
                    .limit(5) \
                    .execute()
                for row in asset_res.data:
                    results.append({
                        "source": "sql_assets",
                        "uat": row.get("uat"),
                        "equipment_tag": row.get("equipment_tag"),
                        "equipment_type": row.get("equipment_type"),
                        "status": row.get("status"),
                        "criticality": row.get("criticality_rating"),
                        "manufacturer": row.get("manufacturer"),
                        "location": row.get("location"),
                    })

                # Search alarm_history for this tag
                alarm_res = db.table("alarm_history") \
                    .select("tag_name, alarm_type, alarm_value, unit, alarm_priority, triggered_at, description") \
                    .ilike("tag_name", f"%{tag}%") \
                    .order("triggered_at", desc=True) \
                    .limit(3) \
                    .execute()
                for row in alarm_res.data:
                    results.append({
                        "source": "sql_alarms",
                        "tag_name": row.get("tag_name"),
                        "alarm_type": row.get("alarm_type"),
                        "alarm_value": row.get("alarm_value"),
                        "unit": row.get("unit"),
                        "priority": row.get("alarm_priority"),
                        "triggered_at": str(row.get("triggered_at", "")),
                        "description": row.get("description"),
                    })
        else:
            # Generic fallback — return recent critical alarms
            alarm_res = db.table("alarm_history") \
                .select("tag_name, alarm_type, alarm_value, unit, alarm_priority, triggered_at") \
                .eq("alarm_priority", "HIGH") \
                .order("triggered_at", desc=True) \
                .limit(5) \
                .execute()
            for row in alarm_res.data:
                results.append({"source": "sql_alarms", **row})

    except Exception as exc:
        logger.warning(f"search_sql failed: {exc}")

    return results


# ---------------------------------------------------------------------------
# 2. Vector / Semantic Search — document_embeddings table via RPC
# ---------------------------------------------------------------------------
def search_vector(query: str) -> List[Dict[str, Any]]:
    """
    Calls the Supabase match_embeddings RPC function to retrieve the most
    semantically relevant document chunks for the query.
    Falls back to a keyword title search if RPC is unavailable.
    """
    results: List[Dict[str, Any]] = []
    try:
        db = _get_db()

        # Try the pgvector RPC function first (requires embeddings to be populated)
        try:
            from app.services.embedding_service import get_embedding
            query_embedding = get_embedding(query)

            rpc_res = db.rpc(
                "match_embeddings",
                {
                    "query_embedding": query_embedding,
                    "match_threshold": 0.0,
                    "match_count": 5
                }
            ).execute()

            for row in (rpc_res.data or []):
                results.append({
                    "source": "vector_search",
                    "chunk_text": row.get("chunk_text", "")[:400],
                    "similarity": row.get("similarity", 0),
                    "doc_title": row.get("doc_title"),
                    "doc_type": row.get("doc_type"),
                    "uat": row.get("uat"),
                })
        except Exception:
            # Fallback: keyword search on document titles
            keywords = query.split()[:4]
            for kw in keywords:
                doc_res = db.table("documents") \
                    .select("doc_id, title, doc_type, uat") \
                    .ilike("title", f"%{kw}%") \
                    .eq("is_active", True) \
                    .limit(3) \
                    .execute()
                for row in doc_res.data:
                    results.append({
                        "source": "vector_keyword_fallback",
                        "doc_title": row.get("title"),
                        "doc_type": row.get("doc_type"),
                        "uat": row.get("uat"),
                        "chunk_text": f"Document titled '{row.get('title')}' is linked to asset {row.get('uat')}.",
                    })

    except Exception as exc:
        logger.warning(f"search_vector failed: {exc}")

    return results


# ---------------------------------------------------------------------------
# 3. Graph / Relationship Search — asset_dependencies table
# ---------------------------------------------------------------------------
def search_graph(query: str) -> List[Dict[str, Any]]:
    """
    Looks up the asset_dependencies table to find relationships for equipment
    tags mentioned in the query.
    """
    results: List[Dict[str, Any]] = []
    try:
        db = _get_db()
        tag_hints = _extract_tag_hints(query)

        if not tag_hints:
            return results

        # Resolve partial tags to full UATs via assets table
        uats_to_search: List[str] = []
        for tag in tag_hints[:3]:
            asset_res = db.table("assets") \
                .select("uat, equipment_tag") \
                .ilike("equipment_tag", f"%{tag}%") \
                .limit(3) \
                .execute()
            for row in asset_res.data:
                uats_to_search.append(row["uat"])

        for uat in list(set(uats_to_search))[:3]:
            dep_res = db.table("asset_dependencies") \
                .select("source_uat, target_uat, relationship_type, dependency_type, flow_type, criticality") \
                .or_(f"source_uat.eq.{uat},target_uat.eq.{uat}") \
                .limit(10) \
                .execute()

            for dep in dep_res.data:
                direction = "downstream" if dep["source_uat"] == uat else "upstream"
                peer = dep["target_uat"] if dep["source_uat"] == uat else dep["source_uat"]
                results.append({
                    "source": "graph_search",
                    "uat": uat,
                    "peer_uat": peer,
                    "direction": direction,
                    "relationship": dep.get("relationship_type"),
                    "dependency_type": dep.get("dependency_type"),
                    "flow_type": dep.get("flow_type"),
                    "criticality": dep.get("criticality"),
                })

    except Exception as exc:
        logger.warning(f"search_graph failed: {exc}")

    return results
