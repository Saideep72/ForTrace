import hashlib
import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, BackgroundTasks
from supabase import Client

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.schemas import DocumentResponse, DocumentListResponse, DocType

logger = logging.getLogger("forttrace.documents")
router = APIRouter()

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    uat: str = Form(...),
    title: str = Form(...),
    doc_type: DocType = Form(...),
    revision: str = Form("1.0"),
    compliance_scope: Optional[str] = Form(None),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Upload a document linked to an asset:
    - Enforces 50MB file limit
    - Computes SHA-256 hash to prevent duplicate files
    - Uploads file to Supabase Storage bucket 'indra-assets'
    - Saves metadata record in PostgreSQL
    """
    uat = uat.strip()
    title = title.strip()
    revision = revision.strip()

    # 1. Enforce RBAC (only Plant_Manager, Maintenance_Engineer, Expert_Engineer, Admin can upload)
    allowed_roles = ["Plant_Manager", "Maintenance_Engineer", "Expert_Engineer", "Admin"]
    if current_user["role"] not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: Role '{current_user['role']}' is not authorized to upload documents."
        )

    # 1.1 Enforce Expert advice security check
    if doc_type == "LESSONS_LEARNED" and current_user["role"] not in ["Expert_Engineer", "Plant_Manager", "Admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: Only Expert Engineers and Admins are authorized to upload Expert Advice (LESSONS_LEARNED)."
        )

    # 2. Check that the linked asset exists in the database
    asset_res = db.table("assets").select("uat").eq("uat", uat).eq("is_active", True).execute()
    if not asset_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Linked asset with UAT '{uat}' not found or is inactive."
        )

    # 3. Read file contents and validate file size (< 50MB)
    file_bytes = await file.read()
    file_size = len(file_bytes)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds the maximum limit of 50MB (current size: {file_size / (1024*1024):.2f}MB)."
        )

    # 4. Generate SHA-256 hash of the file to identify duplicates
    file_hash = hashlib.sha256(file_bytes).hexdigest()

    # 5. Check if document with matching file hash already exists in DB
    existing_doc = db.table("documents").select("*").eq("file_hash", file_hash).eq("is_active", True).execute()
    if existing_doc.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Duplicate content detected: File with this exact content has already been uploaded as '{existing_doc.data[0]['title']}'."
        )

    # 6. Ensure bucket exists and upload file to Supabase Storage
    bucket_name = "indra-assets"
    try:
        # Try to create bucket in case it's a fresh database instance
        db.storage.create_bucket(bucket_name, options={"public": True})
    except Exception:
        pass  # Bucket probably already exists

    # Sanitize filename: replace spaces with underscores, and remove non-alphanumeric/dot/dash/underscore chars
    import re
    clean_filename = re.sub(r"[^\w\.\-]", "", file.filename.replace(" ", "_"))
    # In case sanitization leaves it empty, default to a random uuid
    if not clean_filename or clean_filename.startswith("."):
        clean_filename = f"upload_{hashlib.md5(file_hash.encode()).hexdigest()[:8]}_{clean_filename or 'file'}"
        
    storage_path = f"{doc_type.lower()}s/{uat}/{clean_filename}"
    mime_type = file.content_type or "application/octet-stream"

    try:
        db.storage.from_(bucket_name).upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": mime_type}
        )
    except Exception as e:
        logger.error(f"Error uploading file to Supabase storage bucket: {e}")
        # Try to remove if partially uploaded/conflict exists, and re-upload
        try:
            db.storage.from_(bucket_name).remove([storage_path])
            db.storage.from_(bucket_name).upload(
                path=storage_path,
                file=file_bytes,
                file_options={"content-type": mime_type}
            )
        except Exception as retry_err:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Storage upload failed: {str(retry_err)}"
            )

    # 7. Register metadata record in PostgreSQL documents table
    compliance_scopes = None
    if compliance_scope:
        compliance_scopes = [s.strip() for s in compliance_scope.split(",") if s.strip()]

    doc_payload = {
        "uat": uat,
        "title": title,
        "doc_type": doc_type,
        "file_path": storage_path,
        "file_hash": file_hash,
        "revision": revision,
        "compliance_scope": compliance_scopes,
        "is_active": True,
        "uploaded_by": current_user["user_id"]
    }

    try:
        doc_res = db.table("documents").insert(doc_payload).execute()
        if not doc_res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to register document metadata in database."
            )
        
        inserted_doc = doc_res.data[0]
        # Automatically trigger text extraction and chunking in the background on upload
        try:
            from app.api.v1.endpoints.extraction import process_document
            background_tasks.add_task(
                process_document,
                doc_id=inserted_doc["doc_id"],
                current_user=current_user,
                db=db
            )
            logger.info(f"Scheduled auto-processing background task for document {inserted_doc['doc_id']} on upload.")
        except Exception as proc_err:
            logger.warning(f"Failed to schedule background document extraction: {proc_err}")

        return inserted_doc
    except Exception as e:
        # Clean up storage file if database insert failed (atomic consistency)
        try:
            db.storage.from_(bucket_name).remove([storage_path])
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database metadata registration failed: {str(e)}"
        )


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    uat: Optional[str] = None,
    doc_type: Optional[str] = None,
    limit: int = 10,
    page: int = 1,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    List active documents with optional filters by asset UAT or document type.
    """
    # Enforce positive integers for pagination
    if limit < 1 or page < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pagination parameters 'limit' and 'page' must be positive integers."
        )

    # Start constructing query
    query = db.table("documents").select("*", count="exact").eq("is_active", True)
    
    if uat:
        query = query.eq("uat", uat)
    if doc_type:
        query = query.eq("doc_type", doc_type)

    # Apply pagination offset
    offset = (page - 1) * limit
    try:
        res = query.range(offset, offset + limit - 1).execute()
        total = res.count if res.count is not None else len(res.data)
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "items": res.data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query documents: {str(e)}"
        )


@router.get("/{doc_id}", response_model=DocumentResponse)
async def get_document(
    doc_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Retrieve metadata for a specific document by its UUID.
    """
    try:
        res = db.table("documents").select("*").eq("doc_id", doc_id).eq("is_active", True).execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document with ID '{doc_id}' not found or has been soft-deleted."
            )
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(e)}"
        )


@router.delete("/{doc_id}", status_code=status.HTTP_200_OK)
async def delete_document(
    doc_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Soft delete a document (sets is_active = false).
    Only authorized roles (Plant_Manager, Admin) can perform deletes.
    """
    allowed_roles = ["Plant_Manager", "Admin"]
    if current_user["role"] not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: Role '{current_user['role']}' is not authorized to delete documents."
        )

    # Verify document exists before updating
    existing = db.table("documents").select("*").eq("doc_id", doc_id).eq("is_active", True).execute()
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{doc_id}' not found or is already inactive."
        )

    try:
        # Purge any related text chunks from the document_embeddings table
        try:
            db.table("document_embeddings").delete().eq("doc_id", doc_id).execute()
        except Exception as embed_err:
            logger.warning(f"Could not purge related document_embeddings for {doc_id}: {embed_err}")

        res = db.table("documents").update({"is_active": False}).eq("doc_id", doc_id).execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update document active status."
            )
        return {"detail": f"Document '{doc_id}' has been soft-deleted successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database update failed: {str(e)}"
        )
