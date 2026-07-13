import os
import sys
import logging

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from supabase import create_client
from app.core.config import settings
from app.services.embedding_service import get_embeddings_batch

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("forttrace.backfill")

# Initialize Supabase client
db = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

def main():
    logger.info("Fetching chunks with missing embeddings from database...")
    
    # Query all document chunks where embedding is NULL
    try:
        # Fetch in batches if there are many chunks to prevent memory overload
        res = db.table("document_embeddings").select("embedding_id, chunk_text").is_("embedding", "null").execute()
        chunks = res.data
    except Exception as e:
        logger.error(f"Failed to query database chunks: {e}")
        return

    total_chunks = len(chunks)
    logger.info(f"Found {total_chunks} chunks missing vector embeddings.")

    if total_chunks == 0:
        logger.info("All chunks already have embeddings. Nothing to backfill!")
        return

    # Process in batches of 50
    batch_size = 50
    logger.info(f"Processing in batches of {batch_size}...")
    
    for i in range(0, total_chunks, batch_size):
        batch = chunks[i : i + batch_size]
        logger.info(f"Processing batch {i // batch_size + 1} ({i} to {min(i + batch_size, total_chunks)} of {total_chunks})...")
        
        texts = [item["chunk_text"] for item in batch]
        
        try:
            # Generate vectors
            vectors = get_embeddings_batch(texts)
            
            # Update each chunk in the database
            for idx, item in enumerate(batch):
                emb_id = item["embedding_id"]
                vector = vectors[idx]
                
                db.table("document_embeddings").update({
                    "embedding": vector
                }).eq("embedding_id", emb_id).execute()
                
            logger.info(f"Successfully backfilled batch of {len(batch)} chunks.")
            
        except Exception as e:
            logger.error(f"Failed to process batch starting at index {i}: {e}")
            continue

    logger.info("Embeddings backfill successfully completed!")

if __name__ == "__main__":
    main()
