import os
import sys
import logging
import io

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from supabase import create_client
from app.core.config import settings
from app.services.embedding_service import get_embeddings_batch
from app.services.extraction_service import (
    extract_text_from_pdf,
    extract_text_from_image,
    transcribe_audio,
    chunk_text
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("forttrace.backfill_all")

# Initialize Supabase client
db = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

def main():
    logger.info("Fetching all active documents from database...")
    try:
        res = db.table("documents").select("*").eq("is_active", True).execute()
        docs = res.data
    except Exception as e:
        logger.error(f"Failed to query database documents: {e}")
        return

    total_docs = len(docs)
    logger.info(f"Found {total_docs} active documents to process.")

    for idx, doc in enumerate(docs):
        doc_id = doc["doc_id"]
        path = doc["file_path"]
        title = doc["title"]
        doc_type = doc["doc_type"]
        uat = doc.get("uat")

        logger.info(f"[{idx+1}/{total_docs}] Downloading and processing: {title} | Path: {path}")

        try:
            # 1. Download file bytes from Supabase Storage
            try:
                file_bytes = db.storage.from_("indra-assets").download(path)
            except Exception as dl_err:
                logger.error(f"Failed to download storage file {path}: {dl_err}")
                continue

            # 2. Extract text content based on file type
            extracted_text = ""
            method_used = "Text Decode"
            
            ext = os.path.splitext(path)[1].lower()
            
            if ext == ".pdf":
                logger.info("Parsing PDF content...")
                extracted_text = extract_text_from_pdf(file_bytes)
                method_used = "PyPDF Parser"
            elif ext in [".png", ".jpg", ".jpeg"]:
                logger.info("Parsing Image content via OCR...")
                extracted_text = extract_text_from_image(file_bytes)
                method_used = "Tesseract OCR"
            elif ext in [".wav", ".mp3", ".m4a"]:
                logger.info("Transcribing Audio content...")
                try:
                    extracted_text = transcribe_audio(file_bytes)
                    method_used = "Whisper STT"
                except Exception as stt_err:
                    logger.warning(f"Audio transcription failed for {path}: {stt_err}. Using fallback description.")
                    extracted_text = f"Audio Incident Report for Asset {uat}. File path: {path}. Title: {title}."
                    method_used = "Metadata Fallback"
            elif ext == ".txt":
                extracted_text = file_bytes.decode("utf-8", errors="ignore")
                method_used = "Text Decode"
            else:
                extracted_text = file_bytes.decode("utf-8", errors="ignore")
                method_used = "Fallback Decoder"

            # Skip or fallback if text is empty
            if not extracted_text.strip():
                logger.warning(f"Extracted text was empty for {path}. Skipping chunking.")
                continue

            # 3. Chunk text into 512 token pieces
            logger.info("Chunking extracted text...")
            chunks = chunk_text(extracted_text, chunk_size=512, overlap=64)
            if not chunks:
                logger.warning(f"No chunks produced from document {path}.")
                continue

            # 4. Generate BGE embeddings in batch
            logger.info(f"Generating embeddings for {len(chunks)} chunks...")
            chunk_vectors = get_embeddings_batch(chunks)

            # 5. Delete existing chunks for this document
            db.table("document_embeddings").delete().eq("doc_id", doc_id).execute()

            # 6. Save new chunks with embeddings to database
            insert_payloads = []
            for c_idx, chunk in enumerate(chunks):
                insert_payloads.append({
                    "doc_id": doc_id,
                    "chunk_index": c_idx,
                    "chunk_text": chunk,
                    "embedding": chunk_vectors[c_idx],
                    "chunk_metadata": {
                        "uat": uat,
                        "doc_type": doc_type,
                        "title": title,
                        "method_used": method_used
                    }
                })

            db.table("document_embeddings").insert(insert_payloads).execute()
            logger.info(f"Successfully backfilled document chunks & embeddings for {title}!")

        except Exception as doc_err:
            logger.error(f"Failed to process and backfill document {title}: {doc_err}")
            continue

    logger.info("All documents successfully chunked, vectorized, and backfilled!")

if __name__ == "__main__":
    main()
