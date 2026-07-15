import sys
import os
import dotenv

# Load environment variables from backend/.env
dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), "backend", ".env"))
dotenv.load_dotenv(".env")
dotenv.load_dotenv("backend/.env")

sys.path.append(os.path.abspath("backend/app"))
from app.core.database import init_supabase

def check_all_uploads():
    db = init_supabase()
    
    target_titles = [
        "Air Compressor DCS Alarm Configuration",
        "Digital Twin Reactor R-301 Specification",
        "Environmental Compliance Report 2024 Q2",
        "Heat Exchanger E-201 Maintenance Checklist",
        "Reactor R-200 Project Structural Specs",
        "Storage Tank Safety Standards & Procedures",
        "Storage Tank Safety Standards and Procedures",
        "Heat Exchanger E-201 Spare Parts Catalog 2024",
        "Heat Exchanger E-201 Spare Parts Inventory",
        "Pressure Vessel Reactor Q1 Temperature Telemetry Log",
        "Pressure Vessel Reactor Q1 Temp Structured Log JSON",
        "Centrifugal Pump P-201 Weekly Motor Vibration Log"
    ]
    
    docs = db.table("documents").select("doc_id, title, uat, doc_type").eq("is_active", True).execute().data
    
    print("=======================================================================")
    print("Document Upload & Process Audit (10 Test Cases Verification)")
    print("=======================================================================")
    
    found_count = 0
    for d in docs:
        title = d["title"]
        # Check if the title matches any of our target titles (using substring match to be flexible)
        is_target = any(target.lower() in title.lower() for target in target_titles)
        if not is_target:
            continue
            
        found_count += 1
        doc_id = d["doc_id"]
        uat = d["uat"]
        dtype = d["doc_type"]
        
        # Check chunks
        chunks = db.table("document_embeddings").select("embedding_id").eq("doc_id", doc_id).execute().data
        chunks_count = len(chunks)
        
        # Check entities
        entities = db.table("extracted_entities").select("entity_id").eq("doc_id", doc_id).execute().data
        entities_count = len(entities)
        
        print(f"{found_count}. Title: {title}")
        print(f"   UAT: {uat} | Category: {dtype}")
        print(f"   Doc ID: {doc_id}")
        print(f"   Chunks: {chunks_count} | Extracted Entities: {entities_count}")
        print("-" * 71)
        
    print(f"\nAudit completed. Total matching test cases verified: {found_count} of 10.")
    print("=======================================================================")

if __name__ == "__main__":
    check_all_uploads()
