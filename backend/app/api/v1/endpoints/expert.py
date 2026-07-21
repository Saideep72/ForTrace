import logging
import uuid
from typing import Any, Dict
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.core.database import get_db
from app.core.security import get_current_user
from app.services.embedding_service import get_embedding

logger = logging.getLogger("forttrace.expert")
router = APIRouter()


def _require_expert(current_user: dict):
    """Enforce that only Expert_Engineer can access Expert Portal."""
    allowed = ["Expert_Engineer"]
    if current_user.get("role") not in allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Expert Portal is restricted to Expert Engineers."
        )


@router.get("/failure-cases", status_code=status.HTTP_200_OK)
async def list_failure_cases(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Returns list of all failure incident cases for Expert Review.
    RBAC: Expert_Engineer, Plant_Manager, Admin only.
    """
    _require_expert(current_user)

    try:
        fail_res = db.table("failure_events") \
            .select("failure_id, uat, failure_mode, failure_category, severity, occurrence_date, resolution_date, root_cause, downtime_hours, financial_loss_inr") \
            .order("occurrence_date", desc=True) \
            .execute()

        cases = []
        for f in (fail_res.data or []):
            uat = f.get("uat")
            asset_tag = uat
            asset_type = "Unknown"

            if uat:
                asset_res = db.table("assets") \
                    .select("equipment_tag, equipment_type") \
                    .eq("uat", uat) \
                    .execute()
                if asset_res.data:
                    asset_tag = asset_res.data[0].get("equipment_tag", uat)
                    asset_type = asset_res.data[0].get("equipment_type", "Unknown")

            notes_count = 0
            if uat:
                notes_res = db.table("documents") \
                    .select("doc_id") \
                    .eq("uat", uat) \
                    .eq("doc_type", "LESSONS_LEARNED") \
                    .execute()
                notes_count = len(notes_res.data or [])

            # Derive status from resolution_date
            derived_status = "Resolved" if f.get("resolution_date") else "Open"

            cases.append({
                "failure_id": str(f["failure_id"]),
                "uat": uat,
                "asset_tag": asset_tag,
                "asset_type": asset_type,
                "failure_mode": f.get("failure_mode", "Unknown"),
                "failure_category": f.get("failure_category", "Unknown"),
                "severity": f.get("severity", "medium"),
                "occurrence_date": str(f.get("occurrence_date", "")),
                "status": derived_status,
                "downtime_hours": f.get("downtime_hours"),
                "financial_loss_inr": f.get("financial_loss_inr"),
                "expert_notes_count": notes_count,
            })

        return {"total": len(cases), "cases": cases}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Expert failure-cases list error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/failure-cases/{failure_id}", status_code=status.HTTP_200_OK)
async def get_failure_case_detail(
    failure_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Full incident detail: asset info, alarms, work orders, existing wisdom notes.
    """
    _require_expert(current_user)

    try:
        fail_data = None

        fail_res = db.table("failure_events") \
            .select("*") \
            .eq("failure_id", failure_id) \
            .execute()

        if fail_res.data:
            fail_data = fail_res.data[0]
        else:
            try:
                idx = int(failure_id)
                all_fails = db.table("failure_events") \
                    .select("*") \
                    .order("occurrence_date", desc=True) \
                    .execute()
                if all_fails.data and 0 < idx <= len(all_fails.data):
                    fail_data = all_fails.data[idx - 1]
                else:
                    raise HTTPException(status_code=404, detail=f"Failure case '{failure_id}' not found.")
            except ValueError:
                raise HTTPException(status_code=404, detail=f"Failure case '{failure_id}' not found.")

        uat = fail_data.get("uat")

        asset_info = {}
        if uat:
            ar = db.table("assets").select("*").eq("uat", uat).execute()
            if ar.data:
                asset_info = ar.data[0]

        alarms = []
        if uat:
            alr = db.table("alarm_history") \
                .select("tag_name, alarm_type, alarm_priority, triggered_at") \
                .eq("uat", uat) \
                .order("triggered_at", desc=True) \
                .limit(10) \
                .execute()
            alarms = alr.data or []

        work_orders = []
        if uat:
            wor = db.table("work_orders") \
                .select("wo_id, wo_type, priority, description, status, created_at") \
                .eq("uat", uat) \
                .order("created_at", desc=True) \
                .limit(5) \
                .execute()
            work_orders = wor.data or []

        expert_notes = []
        if uat:
            notes_res = db.table("documents") \
                .select("doc_id, title, revision, updated_at, compliance_scope") \
                .eq("uat", uat) \
                .eq("doc_type", "LESSONS_LEARNED") \
                .order("updated_at", desc=True) \
                .execute()
            expert_notes = notes_res.data or []

        return {
            "failure": fail_data,
            "asset": asset_info,
            "alarms": alarms,
            "work_orders": work_orders,
            "expert_notes": expert_notes
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Expert failure-case detail error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/wisdom", status_code=status.HTTP_201_CREATED)
async def capture_expert_wisdom(
    payload: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Captures a retiring/senior engineer's tacit wisdom note and embeds it
    instantly into the RAG vector store as a LESSONS_LEARNED chunk.
    """
    _require_expert(current_user)

    title = (payload.get("title") or "").strip()
    uat = (payload.get("uat") or "").strip()
    insight_text = (payload.get("insight_text") or "").strip()
    verdict = (payload.get("verdict") or "").strip()
    failure_id = payload.get("failure_id")

    if not title or not uat or not insight_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="title, uat, and insight_text are required."
        )

    asset_res = db.table("assets").select("uat, equipment_tag").eq("uat", uat).execute()
    if not asset_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with UAT '{uat}' not found."
        )
    asset_tag = asset_res.data[0].get("equipment_tag", uat)

    full_text = f"""Expert Wisdom Note — {title}

Asset: {asset_tag} ({uat})

INSIGHT:
{insight_text}

VERDICT / RECOMMENDATION:
{verdict if verdict else 'N/A'}

Submitted by: {current_user.get('email', 'Expert Engineer')}
Date: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}
"""

    try:
        logger.info(f"Generating BGE embedding for expert wisdom note: '{title}'")
        embedding_vector = get_embedding(full_text)

        doc_id = str(uuid.uuid4())
        file_hash = str(uuid.uuid4())

        db.table("documents").insert({
            "doc_id": doc_id,
            "uat": uat,
            "title": f"[EXPERT WISDOM] {title}",
            "doc_type": "LESSONS_LEARNED",
            "file_path": f"expert_wisdom/{uat}/{doc_id}.txt",
            "file_hash": file_hash,
            "revision": "1.0",
            "compliance_scope": [f"Expert-{current_user.get('email', 'unknown')}"],
            "is_active": True,
            "uploaded_by": current_user.get("user_id")
        }).execute()

        chunk_metadata = {
            "uat": uat,
            "asset_tag": asset_tag,
            "doc_type": "LESSONS_LEARNED",
            "source": "expert_wisdom_capture",
            "expert_email": current_user.get("email", "Unknown"),
            "failure_id": str(failure_id) if failure_id else None,
            "title": title,
            "submitted_at": datetime.now(timezone.utc).isoformat()
        }

        db.table("document_embeddings").insert({
            "doc_id": doc_id,
            "chunk_index": 0,
            "chunk_text": full_text,
            "embedding": embedding_vector,
            "chunk_metadata": chunk_metadata
        }).execute()

        logger.info(f"Expert wisdom note '{title}' embedded for asset {uat}")

        return {
            "success": True,
            "doc_id": doc_id,
            "message": f"Expert wisdom '{title}' captured and instantly embedded into the RAG knowledge base. Now retrievable via Expert Shield.",
            "uat": uat,
            "asset_tag": asset_tag,
            "chunk_embedded": True,
            "embedding_dimensions": len(embedding_vector)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Expert wisdom capture error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to capture wisdom: {str(e)}")


@router.get("/registry", status_code=status.HTTP_200_OK)
async def get_expert_registry(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Returns list of all experts and their submitted case reviews (dossiers).
    RBAC: Plant_Manager and Admin only.
    """
    allowed = ["Plant_Manager", "Admin"]
    if current_user.get("role") not in allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Expert Registry is restricted to Plant Managers and Admins."
        )

    try:
        # Fetch all expert documents
        docs_res = db.table("documents") \
            .select("doc_id, uat, title, updated_at, uploaded_by") \
            .eq("doc_type", "LESSONS_LEARNED") \
            .execute()
        
        docs = docs_res.data or []
        if not docs:
            return {"experts": []}

        # Gather user ids and doc ids
        user_ids = list(set([d["uploaded_by"] for d in docs if d.get("uploaded_by")]))
        doc_ids = [d["doc_id"] for d in docs]

        # Fetch user profiles
        users_map = {}
        if user_ids:
            users_res = db.table("users") \
                .select("user_id, email, full_name, role") \
                .in_("user_id", user_ids) \
                .execute()
            for u in (users_res.data or []):
                users_map[u["user_id"]] = u

        # Fetch chunk texts from document_embeddings
        embeddings_map = {}
        if doc_ids:
            emb_res = db.table("document_embeddings") \
                .select("doc_id, chunk_text") \
                .in_("doc_id", doc_ids) \
                .execute()
            for e in (emb_res.data or []):
                embeddings_map[e["doc_id"]] = e.get("chunk_text", "")

        # Group reviews by expert
        experts_dict = {}
        for d in docs:
            uid = d.get("uploaded_by")
            # Fallback for seeded or unknown author
            if not uid:
                uid = "system_default"
                author_name = "Seeded Operational Wisdom"
                author_email = "system@forttrace.com"
                author_role = "System"
            else:
                user_info = users_map.get(uid)
                if user_info:
                    author_name = user_info.get("full_name") or "Unknown Expert"
                    author_email = user_info.get("email") or "unknown@forttrace.com"
                    author_role = user_info.get("role") or "Expert_Engineer"
                else:
                    author_name = "Retired Expert"
                    author_email = "retired@forttrace.com"
                    author_role = "Expert_Engineer"

            if uid not in experts_dict:
                experts_dict[uid] = {
                    "expert_id": uid,
                    "full_name": author_name,
                    "email": author_email,
                    "role": author_role,
                    "reviews_count": 0,
                    "reviews": []
                }

            doc_id = d["doc_id"]
            experts_dict[uid]["reviews"].append({
                "doc_id": doc_id,
                "uat": d.get("uat"),
                "title": d.get("title", "").replace("[EXPERT WISDOM] ", ""),
                "updated_at": d.get("updated_at"),
                "insight": embeddings_map.get(doc_id, "No detailed content found.")
            })
            experts_dict[uid]["reviews_count"] += 1

        # Sort experts by reviews_count desc
        experts_list = list(experts_dict.values())
        experts_list.sort(key=lambda x: x["reviews_count"], reverse=True)

        return {"experts": experts_list}

    except Exception as e:
        logger.error(f"Error fetching expert registry: {e}")
        raise HTTPException(status_code=500, detail=str(e))

