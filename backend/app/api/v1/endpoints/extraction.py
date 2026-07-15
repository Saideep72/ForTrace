import os
import logging
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.core.database import get_db
from app.core.security import get_current_user
from app.services.extraction_service import (
    extract_text_from_pdf,
    extract_text_from_image,
    transcribe_audio,
    chunk_text,
    extract_text_from_docx,
    extract_text_from_zip
)
from app.services import ner_service

logger = logging.getLogger("forttrace.extraction")
router = APIRouter()


@router.post("/process/{doc_id}", status_code=status.HTTP_200_OK)
async def process_document(
    doc_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Triggers the extraction and chunking pipeline for an uploaded document:
    1. Fetches document metadata.
    2. Downloads file binary from Supabase Storage.
    3. Runs PDF reader, Image OCR, or Whisper STT based on file extension.
    4. Segments the text into 512-token chunks.
    5. Inserts chunks into the 'document_embeddings' table.
    """
    # 1. Enforce RBAC (only Plant_Manager, Maintenance_Engineer, Admin can process)
    allowed_roles = ["Plant_Manager", "Maintenance_Engineer", "Admin"]
    if current_user["role"] not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: Role '{current_user['role']}' is not authorized to process documents."
        )

    # 2. Get document metadata from PostgreSQL
    doc_res = db.table("documents").select("*").eq("doc_id", doc_id).eq("is_active", True).execute()
    if not doc_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Active document with ID '{doc_id}' not found."
        )
    
    doc_record = doc_res.data[0]
    file_path = doc_record["file_path"]
    doc_type = doc_record["doc_type"]
    uat = doc_record["uat"]
    title = doc_record["title"]

    # 3. Download file binary from Supabase Storage bucket 'indra-assets'
    bucket_name = "indra-assets"
    try:
        file_bytes = db.storage.from_(bucket_name).download(file_path)
    except Exception as e:
        logger.error(f"Failed to download file '{file_path}' from storage: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Failed to retrieve file from storage path '{file_path}'."
        )

    # 4. Determine file extension and run extraction
    file_ext = os.path.splitext(file_path.lower())[1]
    extracted_text = ""
    method_used = "text_decode"

    try:
        if file_ext == ".pdf":
            extracted_text = extract_text_from_pdf(file_bytes)
            method_used = "pypdf"
        elif file_ext in [".png", ".jpg", ".jpeg"]:
            extracted_text = extract_text_from_image(file_bytes)
            method_used = "tesseract_ocr"
        elif file_ext in [".wav", ".mp3", ".ogg", ".m4a"]:
            extracted_text = transcribe_audio(file_bytes)
            method_used = "whisper_stt"
        elif file_ext in [".txt", ".json", ".csv"]:
            extracted_text = file_bytes.decode("utf-8", errors="ignore")
            method_used = "text_decode"
        elif file_ext == ".docx":
            extracted_text = extract_text_from_docx(file_bytes)
            method_used = "docx_xml_extract"
        elif file_ext == ".zip":
            extracted_text = extract_text_from_zip(file_bytes)
            method_used = "zip_inmemory_extract"
        else:
            # Fallback to text decoding
            extracted_text = file_bytes.decode("utf-8", errors="ignore")
            method_used = "text_decode_fallback"
            
    except Exception as exc:
        logger.error(f"Text extraction failed using {method_used} for {file_path}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract text from file: {str(exc)}"
        )

    if not extracted_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No readable text could be extracted from this document."
        )

    # 5. Chunk the extracted text into ~512 token pieces
    chunks = chunk_text(extracted_text, chunk_size=512, overlap=64)
    if not chunks:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Text splitter failed to produce chunks from extracted text."
        )

    # 6. Save chunks to 'document_embeddings' table with vector embeddings
    # Delete any pre-existing chunks for this document first to prevent duplicates on reprocessing
    try:
        db.table("document_embeddings").delete().eq("doc_id", doc_id).execute()
    except Exception:
        pass  # Ignore if none existed

    # Generate 1024-dim embeddings using sentence-transformers
    try:
        from app.services.embedding_service import get_embeddings_batch
        chunk_vectors = get_embeddings_batch(chunks)
    except Exception as emb_err:
        logger.error(f"Vector embedding generation failed: {emb_err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate vector embeddings: {str(emb_err)}"
        )

    insert_payloads = []
    for idx, chunk in enumerate(chunks):
        insert_payloads.append({
            "doc_id": doc_id,
            "chunk_index": idx,
            "chunk_text": chunk,
            "embedding": chunk_vectors[idx],
            "chunk_metadata": {
                "uat": uat,
                "doc_type": doc_type,
                "title": title,
                "method_used": method_used
            }
        })

    try:
        db.table("document_embeddings").insert(insert_payloads).execute()
    except Exception as e:
        logger.error(f"Failed to save document chunks to database: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database registration of text chunks failed: {str(e)}"
        )

    # 7. Run Phase 5 NER and save entities to Supabase
    entities_count = 0
    try:
        entities = ner_service.extract_entities(extracted_text)
        entities_count = ner_service.save_entities(db, doc_id, entities)
    except Exception as ner_err:
        logger.error(f"NER extraction or saving failed: {ner_err}")

    return {
        "doc_id": doc_id,
        "title": title,
        "method_used": method_used,
        "total_characters": len(extracted_text),
        "chunks_created": len(chunks),
        "entities_extracted": entities_count,
        "chunks": [
            {"chunk_index": p["chunk_index"], "preview": p["chunk_text"][:100] + "..."}
            for p in insert_payloads[:3]
        ]
    }
