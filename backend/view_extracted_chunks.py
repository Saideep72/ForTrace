import sys
import os

# Add parent directory to path so app can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase import create_client
from app.core.config import settings

print("Connecting to Supabase database...")
db = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

print("Fetching most recent extracted chunks from 'document_embeddings'...")
try:
    res = db.table('document_embeddings').select('*').order('created_at', desc=True).limit(5).execute()
    
    if not res.data:
        print("\n❌ No chunks found in the 'document_embeddings' table.")
    else:
        print(f"\n=== Found {len(res.data)} Recent Text Chunks in Database ===\n")
        for idx, row in enumerate(res.data):
            metadata = row.get("chunk_metadata") or {}
            print(f"[{idx + 1}] Document Title: {metadata.get('title', 'N/A')}")
            print(f"    Document ID: {row['doc_id']}")
            print(f"    Chunk Index: {row['chunk_index']}")
            print(f"    Method Used: {metadata.get('method_used', 'N/A')}")
            print(f"    Linked Asset: {metadata.get('uat', 'N/A')}")
            print(f"    Text Preview:")
            print(f"    {row['chunk_text']}")
            print("=" * 60)
except Exception as e:
    print("❌ Failed to query database:", e)
