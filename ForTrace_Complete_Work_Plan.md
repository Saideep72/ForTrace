# ForTrace — Industrial Knowledge Intelligence Platform
## Complete Step-by-Step Work Plan (Production-Grade)

> **Status:** Startup-grade implementation (not hackathon shortcuts)  
> **Team:** Aadesh (Backend + Frontend), Saideep (Database), Anushka (AI Agents)  
> **Database:** Supabase (PostgreSQL + pgvector) — Ready  
> **Philosophy:** Test every phase before moving forward. No broken code propagates.

---

## Table of Contents

1. [Phase 0: Project Setup](#phase-0-project-setup)
2. [Phase 1: Authentication](#phase-1-authentication)
3. [Phase 2: Asset Management](#phase-2-asset-management)
4. [Phase 3: Document Upload + Storage](#phase-3-document-upload--storage)
5. [Phase 4: OCR + Text Extraction](#phase-4-ocr--text-extraction)
6. [Phase 5: NER (Named Entity Recognition)](#phase-5-ner-named-entity-recognition)
7. [Phase 6: Vector Embeddings](#phase-6-vector-embeddings)
8. [Phase 7: Neo4j Knowledge Graph](#phase-7-neo4j-knowledge-graph)
9. [Phase 8: Query Agent Integration](#phase-8-query-agent-integration)
10. [Phase 9: Voice Pipeline](#phase-9-voice-pipeline)
11. [Phase 10: Frontend — Dashboard](#phase-10-frontend--dashboard)
12. [Phase 11: Frontend — Query Interface](#phase-11-frontend--query-interface)
13. [Phase 12: Causal Graph Visualization](#phase-12-causal-graph-visualization)
14. [Phase 13: Reports + Audit](#phase-13-reports--audit)
15. [Phase 14: Integration + End-to-End](#phase-14-integration--end-to-end)
16. [Appendix A: Team Roles](#appendix-a-team-roles)
17. [Appendix B: Tech Stack](#appendix-b-tech-stack)
18. [Appendix C: Database Schema Reference](#appendix-c-database-schema-reference)
19. [Appendix D: Agent Architecture](#appendix-d-agent-architecture)
20. [Appendix E: Cost Analysis](#appendix-e-cost-analysis)

---

## Phase 0: Project Setup
**Duration:** 1-2 hours  
**Owner:** Aadesh  
**Status:** Not Started

### Goal
Get the repository cloned, virtual environment ready, dependencies installed, and the FastAPI server running with Swagger UI visible.

### Steps

| Step | Task | How to Test |
|------|------|-------------|
| 0.1 | Clone repo and create folder structure | `ls` / `dir` — verify all folders exist |
| 0.2 | Create Python venv and install dependencies | `pip list` — verify packages installed |
| 0.3 | Create `.env` file with Supabase URL, keys, Neo4j config | `python -c "from app.core.config import settings; print(settings.SUPABASE_URL)"` |
| 0.4 | Run FastAPI `main.py` | `uvicorn app.main:app --reload` → `http://localhost:8000/docs` shows Swagger UI |
| 0.5 | Test Supabase connection | Health check API returns DB status |

### Folder Structure to Create

```bash
cd C:\AIML\ForTrace
mkdir backend\app\api\v1\endpoints
mkdir backend\app\core
mkdir backend\app\models
mkdir backend\app\services
mkdir backend\app\utils
mkdir backend\app\agents
mkdir frontend\src\components
mkdir frontend\src\pages
mkdir frontend\src\hooks
mkdir frontend\src\store
mkdir docs
mkdir tests
```

### Dependencies to Install

```bash
cd backend
python -m venv venv
venv\Scripts\activate

pip install fastapi uvicorn[standard] sqlalchemy asyncpg pydantic pydantic-settings python-dotenv python-jose[cryptography] passlib[bcrypt] python-multipart supabase neo4j redis httpx python-multipart aiofiles

pip freeze > requirements.txt
```

### Core Files to Create

1. `app/core/config.py` — Environment variables and settings
2. `app/core/database.py` — Supabase + Neo4j connection pools
3. `app/core/security.py` — JWT, password hashing, RBAC
4. `app/main.py` — FastAPI entry point
5. `app/api/v1/router.py` — API route aggregation
6. `.env` — Environment variables (NOT committed to git)

### Test Command

```bash
uvicorn app.main:app --reload
```

Open browser: `http://localhost:8000/docs`

**Expected Output:** Swagger UI loads, health check returns `{"status": "healthy"}`

---

## Phase 1: Authentication
**Duration:** 3-4 hours  
**Owner:** Aadesh  
**Status:** Not Started  
**Why First?** Without login, no API is protected. Every endpoint needs user role context.

### Steps

| Step | Task | How to Test |
|------|------|-------------|
| 1.1 | `POST /api/v1/auth/register` — Create user | Postman → user appears in DB |
| 1.2 | `POST /api/v1/auth/login` — Generate JWT token | Response contains `access_token` |
| 1.3 | `GET /api/v1/auth/me` — Current user profile | Token passed → profile returned |
| 1.4 | Role-based access — Plant_Manager vs Field_Technician | Plant_Manager can do everything; Field_Technician has limited access |
| 1.5 | Password hashing (bcrypt) + JWT validation | Wrong password → 401 Unauthorized |

### RBAC Roles

| Role | Permissions |
|------|-------------|
| `Plant_Manager` | Full access — create, update, delete, approve, audit |
| `Maintenance_Engineer` | View assets, create work orders, upload documents, provide feedback |
| `Safety_Officer` | View compliance, approve SOPs, view audit trails |
| `Field_Technician` | View assigned assets, voice query, view SOPs (read-only most tables) |
| `Quality_Engineer` | View inspections, create reports, compliance checks |
| `Auditor` | Read-only access to audit trails, compliance records, change history |
| `Admin` | User management, system configuration |

### Test Command

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@plant.com","password":"test123"}'
```

**Expected Output:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user_role": "Field_Technician"
}
```

### Validation Checklist

- [ ] Registration creates user in Supabase `users` table
- [ ] Password is hashed (not stored plaintext)
- [ ] JWT token contains user_id, email, role, exp
- [ ] Protected endpoints reject requests without valid token
- [ ] Role-based middleware blocks unauthorized actions
- [ ] Token refresh mechanism works

---

## Phase 2: Asset Management
**Duration:** 4-5 hours  
**Owner:** Aadesh  
**Status:** Not Started  
**Why?** Asset is the anchor — documents, work orders, failures, everything links to an asset.

### Steps

| Step | Task | How to Test |
|------|------|-------------|
| 2.1 | `POST /api/v1/assets` — Create asset with auto-generated UAT | `REF-HTX-R101-001` generated, visible in DB |
| 2.2 | `GET /api/v1/assets/{uat}` — Asset detail by UAT | Full asset data returned |
| 2.3 | `GET /api/v1/assets` — Asset list with filters | `?plant=REF&area=HTX` returns filtered list |
| 2.4 | `PUT /api/v1/assets/{uat}` — Update asset | Status changes `active` → `maintenance` |
| 2.5 | `DELETE /api/v1/assets/{uat}` — Soft delete | `is_active=false` in DB, no hard delete |

### UAT Format

```
{PLANT_CODE}-{AREA_CODE}-{SYSTEM_CODE}-{SEQUENCE}

Example: REF-HTX-R101-001
- REF = Refinery
- HTX = Heat Exchanger Area
- R101 = Reactor System 101
- 001 = Sequence number
```

### Test Data (Create via API)

```json
{
  "uat": "REF-HTX-R101-001",
  "plant_code": "REF",
  "area_code": "HTX",
  "system_code": "R101",
  "equipment_tag": "R-101",
  "equipment_type": "reactor",
  "manufacturer": "Larsen & Toubro",
  "model_number": "LTR-5000",
  "install_date": "2019-03-15",
  "criticality_rating": 5,
  "status": "active",
  "location_description": "Heat Exchanger Area, Row 3, Bay 2",
  "gps_lat": 19.0760,
  "gps_long": 72.8777
}
```

### Validation Checklist

- [ ] UAT auto-generates correctly on create
- [ ] UAT is unique (constraint enforced)
- [ ] Plant code, area code, system code validated against allowed values
- [ ] Criticality rating is 1-5
- [ ] Status transitions are valid (e.g., `active` → `maintenance` is OK, `decommissioned` → `active` is NOT)
- [ ] Soft delete sets `is_active=false`, does not remove row
- [ ] Update updates `updated_at` timestamp

---

## Phase 3: Document Upload + Storage
**Duration:** 4-5 hours  
**Owner:** Aadesh  
**Status:** Not Started  
**Why?** Without documents, RAG cannot retrieve anything. OCR, NER, embeddings all start here.

### Steps

| Step | Task | How to Test |
|------|------|-------------|
| 3.1 | `POST /api/v1/documents/upload` — File upload (PDF, image, audio) | Postman → file saved to storage, DB record created |
| 3.2 | SHA-256 hash generate + duplicate detection | Same file re-uploaded → "duplicate" error |
| 3.3 | Metadata extraction — file type, size, MIME | Response shows metadata |
| 3.4 | UAT link — document linked to asset | `documents` table shows `uat` foreign key |
| 3.5 | Document registry — `GET /api/v1/documents` | List all documents for an asset |

### Supported Document Types

| Type | Extension | Purpose |
|------|-----------|---------|
| `SOP` | `.pdf` | Standard Operating Procedures |
| `OEM_MANUAL` | `.pdf` | Original Equipment Manufacturer manuals |
| `P&ID` | `.pdf`, `.dwg` | Piping & Instrumentation Diagrams |
| `WORK_ORDER` | `.pdf` | Maintenance work orders |
| `INSPECTION_REPORT` | `.pdf`, `.jpg` | Inspection findings |
| `REGULATORY_FILING` | `.pdf` | Factory Act, OISD, PESO compliance |
| `INCIDENT_REPORT` | `.pdf` | Failure/event reports |
| `LESSONS_LEARNED` | `.pdf`, `.docx` | Post-incident knowledge capture |

### Storage Structure (Supabase Storage / MinIO)

```
indra-assets/
├── pids/
│   └── {uat}/
│       └── P&ID-{uat}-Rev{N}.pdf
├── manuals/
│   └── {uat}/
│       └── OEM-{uat}-Rev{N}.pdf
├── sops/
│   └── {uat}/
│       └── SOP-{area}-{N}-Rev{N}.pdf
├── inspection-photos/
│   └── {uat}/
│       └── {date}/
│           └── {finding_description}.jpg
├── work-orders/
│   └── {wo_id}/
│       └── WO-{wo_id}.pdf
├── regulatory/
│   └── {regulation_name}/
│       └── {clause}.pdf
└── temp-uploads/
    └── {session_id}/
        └── {filename}  (before validation)
```

### Validation Checklist

- [ ] File size limit enforced (e.g., 50MB max)
- [ ] Allowed MIME types checked
- [ ] SHA-256 hash computed and stored
- [ ] Duplicate file rejected with clear error
- [ ] File stored in correct bucket/path
- [ ] DB record created with all metadata
- [ ] UAT foreign key validated (asset must exist)
- [ ] `uploaded_by` set to current user
- [ ] `uploaded_at` timestamp set

---

## Phase 4: OCR + Text Extraction
**Duration:** 3-4 hours  
**Owner:** Aadesh  
**Status:** Not Started  
**Why?** Cannot search or embed documents without extracting text first.

### Steps

| Step | Task | How to Test |
|------|------|-------------|
| 4.1 | PDF text extraction (PyPDF2 / pdfplumber) | Upload PDF → extracted text returned |
| 4.2 | Image OCR (Tesseract / EasyOCR) | Upload P&ID image → text extracted |
| 4.3 | Save extracted text to `documents` table | `extracted_text` column populated |
| 4.4 | Text chunking — split into ~512 token pieces | Chunks visible in `document_embeddings` |
| 4.5 | Save chunks to `document_embeddings` (text only, `embedding=null`) | `chunk_text` visible, `embedding` is null |

### Chunking Strategy

```python
# Pseudocode
CHUNK_SIZE = 512      # tokens
CHUNK_OVERLAP = 64    # tokens overlap between chunks

# Split by:
# 1. Paragraph boundaries (preferable)
# 2. Sentence boundaries (fallback)
# 3. Fixed token count (last resort)
```

### Test Command

```bash
curl -X POST http://localhost:8000/api/v1/documents/extract \
  -F "file=@P&ID_sample.pdf" \
  -F "uat=REF-HTX-R101-001" \
  -H "Authorization: Bearer {jwt_token}"
```

**Expected Output:**
```json
{
  "doc_id": "550e8400-e29b-41d4-a716-446655440000",
  "uat": "REF-HTX-R101-001",
  "extracted_text": "Reactor R-101 operates at 480°C...",
  "chunks_created": 12,
  "chunk_preview": [
    {"index": 0, "text": "Reactor R-101 operates at 480°C...", "tokens": 498},
    {"index": 1, "text": "Cooling water is supplied by Heat Exchanger...", "tokens": 512}
  ],
  "processing_time_ms": 2340
}
```

### Validation Checklist

- [ ] PDF text extraction handles scanned PDFs (fallback to OCR)
- [ ] Image OCR handles low-resolution images
- [ ] Chunk boundaries respect sentence/paragraph boundaries
- [ ] No chunk exceeds max token limit
- [ ] Overlap prevents context loss at boundaries
- [ ] `chunk_index` is sequential per document
- [ ] `doc_id` foreign key validated

---

## Phase 5: NER (Named Entity Recognition)
**Duration:** 3-4 hours  
**Owner:** Aadesh  
**Status:** Not Started  
**Why?** Equipment tags, pressure ratings, part numbers must be extracted before building the knowledge graph.

### Steps

| Step | Task | How to Test |
|------|------|-------------|
| 5.1 | Load spaCy / transformers NER model | Model loads, time logged |
| 5.2 | Run NER on extracted text | Equipment tags (`R-101`, `P-201-A`) extracted |
| 5.3 | Format entities as structured JSON | `{"entities": [...]}` format |
| 5.4 | Save entities to `extracted_entities` table | Records visible in DB |
| 5.5 | Link entities to document and asset | `doc_id` + `uat` foreign keys present |

### Entity Types to Extract

| Entity Type | Examples | Regex Pattern |
|-------------|----------|---------------|
| `EQUIPMENT_TAG` | R-101, P-201-A, E-301, T-401 | `[A-Z]-\d{3}(-[A-Z])?` |
| `TEMPERATURE` | 480°C, 150°F, 300K | `\d+\s*(°C|°F|K)` |
| `PRESSURE` | 150 bar, 2000 psi, 10 MPa | `\d+\s*(bar|psi|MPa|kPa)` |
| `FLOW_RATE` | 150 m³/hr, 50 GPM | `\d+\s*(m³/hr|GPM|L/min)` |
| `PART_NUMBER` | SKF-6314, Shell-N3 | `[A-Z]+-\w+` |
| `MANUFACTURER` | Larsen & Toubro, KSB Pumps | Known list + NER |
| `DATE` | 2025-04-12, April 12, 2025 | Date parsing |
| `PERSON` | Rajesh Kumar, Anil Sharma | spaCy NER |
| `REGULATION` | Factory Act 1948, OISD-144 | Known list + regex |

### Test Text

```
"Reactor R-101 operates at 480°C with cooling from Heat Exchanger E-201. 
Pump P-201-A feeds cooling water at 150 m³/hr. 
Last inspection by Rajesh Kumar on 2025-04-12 found bearing SKF-6314 worn."
```

### Expected Output

```json
{
  "entities": [
    {"type": "EQUIPMENT_TAG", "value": "R-101", "start": 8, "end": 13, "confidence": 0.98},
    {"type": "TEMPERATURE", "value": "480°C", "start": 29, "end": 34, "confidence": 0.95},
    {"type": "EQUIPMENT_TAG", "value": "E-201", "start": 59, "end": 64, "confidence": 0.97},
    {"type": "EQUIPMENT_TAG", "value": "P-201-A", "start": 66, "end": 73, "confidence": 0.96},
    {"type": "FLOW_RATE", "value": "150 m³/hr", "start": 101, "end": 110, "confidence": 0.94},
    {"type": "PERSON", "value": "Rajesh Kumar", "start": 133, "end": 145, "confidence": 0.92},
    {"type": "DATE", "value": "2025-04-12", "start": 149, "end": 159, "confidence": 0.99},
    {"type": "PART_NUMBER", "value": "SKF-6314", "start": 174, "end": 182, "confidence": 0.91}
  ]
}
```

### Validation Checklist

- [ ] Model loads within acceptable time (<30s on CPU)
- [ ] All expected entity types are extracted
- [ ] Confidence scores provided for each entity
- [ ] Character offsets are accurate
- [ ] Entities linked to correct `doc_id` and `uat`
- [ ] Duplicate entities within same document handled
- [ ] Partial matches filtered out (confidence < 0.7)

---

## Phase 6: Vector Embeddings
**Duration:** 3-4 hours  
**Owner:** Aadesh  
**Status:** Not Started  
**Why?** Semantic search requires vector embeddings. Without this, RAG cannot find relevant documents.

### Steps

| Step | Task | How to Test |
|------|------|-------------|
| 6.1 | Load BGE-M3 / sentence-transformers model | Model loads successfully |
| 6.2 | Convert text chunks to embeddings | 1024-dim vector generated per chunk |
| 6.3 | Update `document_embeddings` table with vectors | `embedding` column populated |
| 6.4 | Verify pgvector HNSW index | `EXPLAIN ANALYZE` shows index usage |
| 6.5 | Test similarity search | Query returns top 5 similar chunks |

### Model: BGE-M3 (Recommended)

- **Dimensions:** 1024
- **Best for:** Technical documents, multi-lingual support
- **License:** MIT (free, commercial use)
- **Size:** ~2.3GB
- **Alternative:** `sentence-transformers/all-MiniLM-L6-v2` (384-dim, lighter)

### SQL for pgvector Setup

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE document_embeddings (
    embedding_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_id UUID REFERENCES documents(doc_id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding VECTOR(1024),
    chunk_metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(doc_id, chunk_index)
);

-- HNSW index for fast similarity search
CREATE INDEX idx_doc_embeddings_hnsw ON document_embeddings 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 128);

-- Full-text search index
CREATE INDEX idx_doc_embeddings_fts ON document_embeddings 
USING gin(to_tsvector('english', chunk_text));
```

### Test Command

```bash
curl -X POST http://localhost:8000/api/v1/search/semantic \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {jwt_token}" \
  -d '{"query": "emergency shutdown procedure reactor", "top_k": 5}'
```

**Expected Output:**
```json
{
  "query": "emergency shutdown procedure reactor",
  "results": [
    {
      "chunk_index": 3,
      "chunk_text": "Emergency shutdown procedure: 1. Close feed valve FV-101...",
      "doc_id": "550e8400-e29b-41d4-a716-446655440000",
      "similarity_score": 0.94,
      "uat": "REF-HTX-R101-001"
    },
    {
      "chunk_index": 7,
      "chunk_text": "In case of high temperature trip, immediately activate...",
      "doc_id": "550e8400-e29b-41d4-a716-446655440001",
      "similarity_score": 0.89,
      "uat": "REF-HTX-R101-001"
    }
  ],
  "total_results": 5,
  "search_time_ms": 45
}
```

### Validation Checklist

- [ ] Embedding generation works for all chunks
- [ ] Vector dimension matches table definition (1024)
- [ ] HNSW index created and used (verify with EXPLAIN)
- [ ] Cosine similarity returns relevant results
- [ ] Search time < 100ms for 1000+ chunks
- [ ] Handles empty query gracefully
- [ ] Filters by UAT when specified

---

## Phase 7: Neo4j Knowledge Graph
**Duration:** 4-5 hours  
**Owner:** Aadesh (with Saideep for schema)  
**Status:** Not Started  
**Why?** Asset relationships, causal chains, dependency mapping — all live in the graph.

### Steps

| Step | Task | How to Test |
|------|------|-------------|
| 7.1 | Neo4j local / Aura setup | `http://localhost:7474` shows Neo4j Browser |
| 7.2 | Create asset nodes | `CREATE (a:Asset {uat: 'REF-HTX-R101-001'})` |
| 7.3 | Create document nodes + `HAS_SOP` relationship | `(Asset)-[:HAS_SOP]->(Document)` visible |
| 7.4 | Create dependency relationships | `(R-101)-[:DEPENDS_ON]->(E-201)` visible |
| 7.5 | Test Cypher query | Query returns expected dependencies |

### Neo4j Node Types

| Node Label | Properties | Purpose |
|------------|-----------|---------|
| `Asset` | uat, plant, area, system, equipment_type, tag, criticality, status | Equipment registry |
| `Document` | doc_id, doc_type, title, revision, compliance_scope | Document metadata |
| `Failure` | failure_id, failure_mode, category, severity, occurrence_date | Failure events |
| `RootCause` | cause_id, cause_type, description, category | Root cause analysis |
| `WorkOrder` | wo_id, wo_type, priority, status | Maintenance records |
| `Inspection` | inspection_id, inspection_type, severity | Inspection findings |
| `Person` | person_id, name, role, years_of_service, expertise | Expert knowledge |
| `Regulation` | name, clause, description | Compliance standards |
| `Defect` | defect_id, description, severity | Identified defects |

### Neo4j Relationship Types

| Relationship | From | To | Properties |
|--------------|------|-----|------------|
| `HAS_SOP` | Asset | Document | effective_from, section |
| `HAS_MANUAL` | Asset | Document | revision |
| `HAS_FAILURE` | Asset | Failure | timestamp |
| `CAUSED_BY` | Failure | RootCause | confidence, evidence_type |
| `ADDRESSED_BY` | RootCause | WorkOrder | effectiveness |
| `PERFORMED_ON` | WorkOrder | Asset | completion_date |
| `HAS_INSPECTION` | Asset | Inspection | inspection_date |
| `IDENTIFIED` | Inspection | Defect | confidence |
| `DEPENDS_ON` | Asset | Asset | dependency_type, criticality |
| `FEEDS_INTO` | Asset | Asset | flow_type, capacity_m3hr |
| `GOVERNED_BY` | Document | Regulation | effective_date |
| `HAS_MAINTENANCE_HISTORY` | Asset | WorkOrder | maintenance_type, last_date, next_due |
| `HAS_EXPERTISE_ON` | Person | Asset | level, years |
| `AUTHORIZED` | Person | WorkOrder | authorization_type |
| `TEMPORALLY_NEAR` | Failure | Failure | hours_diff, relation |
| `GEOGRAPHICALLY_NEAR` | Asset | Asset | meters |

### Test Cypher Query

```cypher
// Find all failures for R-101 with root causes
MATCH (a:Asset {uat: 'REF-HTX-R101-001'})-[:HAS_FAILURE]->(f:Failure)-[:CAUSED_BY]->(rc:RootCause)
RETURN a.tag, f.failure_mode, f.occurrence_date, rc.cause_type, rc.description

// Find cooling loop dependencies
MATCH (a:Asset {uat: 'REF-HTX-R101-001'})-[:DEPENDS_ON]->(dep:Asset)
RETURN a.tag, dep.tag, dep.equipment_type

// Find causal chain: Asset → Failure → RootCause → WorkOrder
MATCH path = (a:Asset)-[:HAS_FAILURE]->(f:Failure)-[:CAUSED_BY]->(rc:RootCause)-[:ADDRESSED_BY]->(wo:WorkOrder)
WHERE a.uat = 'REF-HTX-R101-001'
RETURN path
```

### Validation Checklist

- [ ] All constraints created (UNIQUE on uat, doc_id, etc.)
- [ ] All indexes created for performance
- [ ] Seed data creates connected graph (not isolated nodes)
- [ ] Cypher queries return expected results
- [ ] Graph visualization shows relationships clearly
- [ ] Path queries work for multi-hop traversals

---

## Phase 8: Query Agent Integration
**Duration:** 4-5 hours  
**Owner:** Aadesh (Anushka provides agent code)  
**Status:** Not Started  
**Why?** Backend is built. Now connect to Anushka's agent system.

### Steps

| Step | Task | How to Test |
|------|------|-------------|
| 8.1 | `POST /api/v1/query/ask` — Mock agent response | Query sent → mock JSON response returned |
| 8.2 | Request validation — Pydantic schema | Invalid request → 422 error |
| 8.3 | Query audit logging — `query_audit_log` table | Every query logged in DB |
| 8.4 | Source citations format | Response contains `sources` array |
| 8.5 | Connect to Anushka's actual agent | Real agent response returned |

### Query Request Schema

```json
{
  "query": "What is the emergency shutdown procedure for R-101?",
  "query_language": "en",
  "session_id": "sess_abc123",
  "user_id": "tech_001",
  "user_role": "Field_Technician",
  "context": {
    "last_query": null,
    "current_asset": null,
    "shift": "night"
  }
}
```

### Query Response Schema

```json
{
  "answer": "The emergency shutdown procedure for R-101 involves: (1) Close feed valve FV-101, (2) Activate cooling loop bypass, (3) Depressurize via PV-201...",
  "sources": [
    {
      "type": "SOP",
      "uat": "REF-HTX-R101-001",
      "doc_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Emergency Shutdown Procedure R-101",
      "section": "4.2",
      "confidence": 0.94,
      "relevance": 0.91,
      "page": 12
    }
  ],
  "confidence": 0.92,
  "visualization": {
    "type": "causal_graph",
    "data": {
      "nodes": ["R-101", "TIC-101", "E-201", "Cooling Water"],
      "edges": ["tripped_due_to", "fouling_in", "requires_inspection"]
    }
  },
  "prediction": {
    "next_failure_risk": 0.82,
    "recommended_action": "Schedule E-201 cleaning within 48 hours",
    "confidence_interval": [0.75, 0.89]
  },
  "follow_up_suggestions": [
    "Show me the maintenance history of E-201",
    "What are the compliance requirements for R-101?"
  ],
  "agent_used": "QueryAgent",
  "processing_time_ms": 450
}
```

### Mock Test

```bash
curl -X POST http://localhost:8000/api/v1/query/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {jwt_token}" \
  -d '{
    "query": "What is the emergency shutdown procedure for R-101?",
    "user_id": "tech_001",
    "user_role": "Field_Technician"
  }'
```

### Validation Checklist

- [ ] Request validated by Pydantic (all required fields present)
- [ ] Query logged to `query_audit_log` before processing
- [ ] User role checked against endpoint permissions
- [ ] Response contains `answer` + `sources` + `confidence`
- [ ] Sources contain `type`, `uat`, `doc_id`, `section`, `confidence`
- [ ] Visualization data present when applicable
- [ ] Follow-up suggestions provided
- [ ] Processing time logged
- [ ] Error responses have consistent format

---

## Phase 9: Voice Pipeline
**Duration:** 3-4 hours  
**Owner:** Aadesh  
**Status:** Not Started  
**Why?** Field technicians wear helmets and carry tools — they need hands-free, voice-based interaction.

### Steps

| Step | Task | How to Test |
|------|------|-------------|
| 9.1 | Audio file upload endpoint | MP3/WAV upload successful |
| 9.2 | Deepgram / Whisper STT | Audio → text conversion |
| 9.3 | Hindi/English language detection | `hi` or `en` detected correctly |
| 9.4 | Translation (IndicTrans2) — Hindi → English | Hindi text converted to English |
| 9.5 | Send translated text to query agent | Final English query reaches agent |

### Voice Pipeline Flow

```
[User speaks in Hindi] 
    ↓
[Audio Upload] → POST /api/v1/query/voice
    ↓
[STT: Whisper / Deepgram] → "R-101 kal raat kyun trip hua?"
    ↓
[Language Detection] → "hi" (Hindi)
    ↓
[Translation: IndicTrans2] → "Why did R-101 trip last night?"
    ↓
[Send to Query Agent] → Process as text query
    ↓
[Response Translation] → Hindi response (if user prefers)
    ↓
[TTS: Cartesia / Web Speech API] → Spoken response (optional)
```

### Test Command

```bash
curl -X POST http://localhost:8000/api/v1/query/voice \
  -F "audio=@hindi_query.wav" \
  -F "user_id=tech_001" \
  -F "preferred_language=hi" \
  -H "Authorization: Bearer {jwt_token}"
```

**Expected Output:**
```json
{
  "transcribed": "R-101 kal raat kyun trip hua?",
  "translated": "Why did R-101 trip last night?",
  "language": "hi",
  "confidence": 0.96,
  "agent_response": {
    "answer": "R-101 high temperature trip hua tha...",
    "sources": [...],
    "confidence": 0.91
  },
  "response_in_hindi": "R-101 high temperature ki wajah se trip hua tha...",
  "processing_time_ms": 1200
}
```

### Validation Checklist

- [ ] Audio file formats supported: MP3, WAV, OGG, M4A
- [ ] File size limit enforced (e.g., 10MB max, 60 seconds max)
- [ ] STT accuracy > 90% for Hindi technical terms
- [ ] Language detection accuracy > 95%
- [ ] Translation preserves technical terminology
- [ ] End-to-end latency < 3 seconds
- [ ] Fallback to text if voice processing fails

---

## Phase 10: Frontend — Dashboard
**Duration:** 5-6 hours  
**Owner:** Aadesh  
**Status:** Not Started  
**Why?** Judges need to see a professional industrial interface, not a chatbot.

### Steps

| Step | Task | How to Test |
|------|------|-------------|
| 10.1 | React + Vite + Tailwind setup | `npm run dev` → blank page loads |
| 10.2 | Login page — JWT stored in localStorage | Login successful, token saved |
| 10.3 | Dashboard — asset cards with status | 5+ assets visible, color-coded status |
| 10.4 | Asset detail page — tabs (Overview, Documents, History) | Tab switching works |
| 10.5 | Document list with upload button | Documents listed, upload functional |

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  FORTRACE  |  Plant: REF  |  Shift: Night  |  Live     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ R-101    │  │ P-201    │  │ E-201    │  │ C-301    │  │
│  │ ALERT    │  │ OK       │  │ WARN     │  │ OK       │  │
│  │ 485°C    │  │ 1200 RPM │  │ +12% vib │  │ Standby  │  │
│  │ Reactor  │  │ Pump     │  │ HX       │  │ Compress │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Recent Alerts                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ CRITICAL  R-101  High Temperature Trip  02:14      │   │
│  │ WARNING   E-201  Vibration +12%         01:45      │   │
│  │ INFO      P-201  Maintenance Due        06:00      │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Quick Actions                                              │
│  [Upload Document]  [Search Knowledge]  [Reports]        │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 18 + TypeScript | Type-safe UI |
| Build Tool | Vite | Fast dev server, optimized builds |
| Styling | Tailwind CSS | Utility-first styling |
| State Management | Zustand | Lightweight, no boilerplate |
| Routing | React Router v6 | SPA navigation |
| HTTP Client | Axios | API calls with interceptors |
| Charts | Recharts / D3.js | Data visualization |
| Icons | Lucide React | Consistent icon set |
| Notifications | Sonner | Toast notifications |

### Validation Checklist

- [ ] Login form validates email/password
- [ ] JWT stored securely (httpOnly cookie preferred, localStorage acceptable)
- [ ] Token refresh works automatically
- [ ] Dashboard loads < 2 seconds
- [ ] Asset cards show real-time status
- [ ] Color coding: Critical, Warning, OK, Standby
- [ ] Responsive layout (desktop + tablet)
- [ ] Dark mode support (industrial standard)

---

## Phase 11: Frontend — Query Interface
**Duration:** 4-5 hours  
**Owner:** Aadesh  
**Status:** Not Started  
**Why?** This is the primary interaction point — technicians ask questions here.

### Steps

| Step | Task | How to Test |
|------|------|-------------|
| 11.1 | Search bar with text input | Type, submit, response displayed |
| 11.2 | Mic button for voice query | Click, record, stop, processing |
| 11.3 | Response display — answer + sources | Answer visible, sources clickable |
| 11.4 | Source click → document viewer | SOP section displayed |
| 11.5 | Loading states + error handling | Skeleton loader, error messages |

### Query Interface Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Ask ForTrace                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Hold to Speak]  or  Type your question...  Search │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Response                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Reactor R-101 tripped due to high temperature in    │   │
│  │ the cooling loop (TIC-101 alarm at 02:14 AM).      │   │
│  │                                                     │   │
│  │ Root cause: Fouling in Heat Exchanger E-201.      │   │
│  │                                                     │   │
│  │ Before restart:                                     │   │
│  │ 1. Inspect E-201 tube bundle                       │   │
│  │ 2. Verify cooling water flow > 150 m3/hr           │   │
│  │ 3. Check safety interlock SIL-1 test certificate   │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Sources (4)                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ SOP-HTX-101 Rev 3, Section 4.2  [Confidence: 94%]  │   │
│  │ DCS Alarm: TIC-101 @ 02:14      [Confidence: 97%]  │   │
│  │ WO-2025-0847 (E-201 Cleaning)   [Confidence: 91%]  │   │
│  │ Inspection Photo: Tube Fouling  [Confidence: 88%]  │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Causal Graph                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │    [E-201] --fouling--> [Cooling▼] --> [R-101]    │   │
│  │       │                      │                        │   │
│  │   [WO-0847]              [TIC-101]                   │   │
│  │   14mo ago               485°C @ 02:14             │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Suggested Follow-ups                                       │
│  [Show maintenance history] [Compliance status] [Schedule repair]│
└─────────────────────────────────────────────────────────────┘
```

### Validation Checklist

- [ ] Search bar accepts text input
- [ ] Mic button records audio (browser permission handled)
- [ ] Loading state shown during processing
- [ ] Response formatted with markdown support
- [ ] Sources are clickable and open document viewer
- [ ] Causal graph renders interactively
- [ ] Follow-up suggestions are clickable
- [ ] Error states show user-friendly messages
- [ ] Query history maintained per session

---

## Phase 12: Causal Graph Visualization
**Duration:** 4-5 hours  
**Owner:** Aadesh  
**Status:** Not Started  
**Why?** This is the "wow" factor — judges see relationships, not just text.

### Steps

| Step | Task | How to Test |
|------|------|-------------|
| 12.1 | D3.js / React-Flow setup | Blank graph canvas visible |
| 12.2 | Static causal graph render | Nodes + edges displayed |
| 12.3 | Node click → detail panel | Click opens side panel with info |
| 12.4 | Dynamic graph from API | Agent response renders as graph |
| 12.5 | Zoom, pan, fit-to-screen | Graph interactions work |

### Graph Features

| Feature | Implementation | Test |
|---------|---------------|------|
| Node types | Different shapes/colors per entity type | Asset=circle, Failure=diamond, WorkOrder=square |
| Edge labels | Show relationship type on hover | DEPENDS_ON, CAUSED_BY visible |
| Node click | Open detail panel with full info | Panel slides in from right |
| Path highlighting | Highlight causal chain | Click root cause → full path lights up |
| Zoom/Pan | Mouse wheel + drag | Smooth zoom, pan bounds enforced |
| Fit to screen | Auto-fit button | All nodes visible in viewport |
| Legend | Show node/edge type meanings | Always visible |

### Validation Checklist

- [ ] Graph renders without layout overlap
- [ ] Nodes are distinguishable by type
- [ ] Edges show relationship labels
- [ ] Clicking node opens detail panel
- [ ] Detail panel shows all node properties
- [ ] Causal path can be highlighted
- [ ] Graph is responsive to container size
- [ ] Performance: < 2s to render 50 nodes

---

## Phase 13: Reports + Audit
**Duration:** 3-4 hours  
**Owner:** Aadesh  
**Status:** Not Started  
**Why?** Compliance, audit readiness, and professional documentation.

### Steps

| Step | Task | How to Test |
|------|------|-------------|
| 13.1 | RCA report PDF generation | `POST /api/v1/reports/rca` → PDF download |
| 13.2 | Compliance package generation | Audit evidence PDF generated |
| 13.3 | Engineering change record viewer | Git-like commit history visible |
| 13.4 | Audit trail search/filter | Date range, user filter works |

### Report Types

| Report | Content | Trigger |
|--------|---------|---------|
| RCA Report | Failure event, causal chain, root causes, recommendations, evidence | User request or auto on critical failure |
| Compliance Package | Regulation status, gaps, evidence documents, risk scores | Audit preparation |
| Maintenance Schedule | Upcoming work orders, overdue items, predictive recommendations | Daily/weekly auto-generation |
| Asset Health Report | Sensor trends, failure probability, RUL estimates | Monthly or on-demand |

### PDF Generation

```python
# Using ReportLab or WeasyPrint
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, Paragraph

def generate_rca_pdf(failure_id: str) -> bytes:
    """Generate RCA report as PDF"""
    doc = SimpleDocTemplate(f"RCA_Report_{failure_id}.pdf", pagesize=A4)
    # ... build report content
    return pdf_bytes
```

### Validation Checklist

- [ ] PDF contains all required sections
- [ ] PDF includes source citations
- [ ] PDF includes causal graph image
- [ ] PDF is downloadable via API
- [ ] Audit trail shows all changes with timestamps
- [ ] Audit trail is immutable (no edit/delete)
- [ ] Filters work: date range, user, action type
- [ ] Engineering change record shows Merkle tree verification

---

## Phase 14: Integration + End-to-End
**Duration:** 4-5 hours  
**Owner:** Aadesh (all team)  
**Status:** Not Started  
**Why?** Individual features work — now make them work together.

### Steps

| Step | Task | How to Test |
|------|------|-------------|
| 14.1 | Full flow: Upload → Extract → Query → Response | Manual test of every step |
| 14.2 | Voice query → Hindi → English → Agent → Response → Hindi | End-to-end voice flow |
| 14.3 | Mobile responsive check | UI looks correct on phone |
| 14.4 | Performance — 1000 assets load time | Dashboard loads < 2 seconds |
| 14.5 | Error scenarios — DB down, agent timeout | Graceful error messages |

### End-to-End Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Document Upload to Query | Upload P&ID → Extract text → Embed → Query "What is R-101 connected to?" | Returns correct answer with P&ID source |
| Voice RCA | Voice: "Why did R-101 trip?" → STT → Translate → Agent → Causal Graph | Full causal chain displayed |
| Compliance Check | Query: "Is E-201 compliant?" → Compliance Agent → Gap Report | Shows 55 days overdue, generates PDF |
| Expert Feedback | Engineer corrects AI response → Feedback saved → DPO+LoRA trigger | Model improves over time |

### Error Scenarios

| Scenario | Behavior |
|----------|----------|
| Database connection lost | Retry 3x, then show "System maintenance, please try later" |
| Agent timeout (>10s) | Return partial results + "Processing in background" notification |
| Invalid file upload | Clear error: "File type not supported. Allowed: PDF, JPG, PNG" |
| Unauthorized access | 403 with message: "Field Technicians cannot approve SOPs" |
| Empty search results | "No documents found. Try rephrasing or uploading relevant documents." |

### Validation Checklist

- [ ] All 14 phases tested individually
- [ ] End-to-end flow works without manual intervention
- [ ] Mobile UI is usable
- [ ] Performance meets targets
- [ ] Error handling is graceful and informative
- [ ] No console errors in browser
- [ ] API response times logged and within SLA

---

## Appendix A: Team Roles

### Aadesh (You) — Backend + Frontend

| Responsibility | Deliverables |
|----------------|-------------|
| FastAPI Backend | All API endpoints, auth, validation, error handling |
| Frontend (React) | Dashboard, query interface, causal graph, reports |
| Integration | Connect to Saideep's DB, Anushka's agents |
| DevOps | Docker setup, deployment scripts |

### Saideep — Database + Infrastructure

| Responsibility | Deliverables |
|----------------|-------------|
| PostgreSQL Schema | 15+ tables with constraints, indexes, FKs |
| Supabase Setup | Live database, connection pools, RLS policies |
| Neo4j Setup | Graph schema, constraints, seed data |
| Seed Data | Realistic demo data for all tables |
| Docker Compose | Local development environment |

### Anushka — AI Agents

| Responsibility | Deliverables |
|----------------|-------------|
| LangGraph Supervisor | Router, state machine, synthesis |
| Query Agent | Hybrid RAG with citations |
| RCA Agent | Causal chain extraction, root cause ranking |
| Predictive Agent | Failure probability, RUL estimation |
| Network Agent | Dependency mapping, cascade analysis |
| Compliance Agent | Gap detection, audit packages |

---

## Appendix B: Tech Stack

### Backend

| Component | Technology | Version | Cost |
|-----------|-----------|---------|------|
| Framework | FastAPI | 0.111+ | Free |
| Validation | Pydantic v2 | 2.7+ | Free |
| Database ORM | SQLAlchemy 2.0 | 2.0+ | Free |
| Async DB | asyncpg | 0.29+ | Free |
| Auth | python-jose + passlib | 3.3+ | Free |
| Graph DB | Neo4j Python Driver | 5.21+ | Free (Community) |
| Vector DB | pgvector (PostgreSQL ext) | 0.7+ | Free |
| Cache | redis-py | 5.0+ | Free |
| HTTP Client | httpx | 0.27+ | Free |
| File Upload | python-multipart | 0.0.9+ | Free |

### Frontend

| Component | Technology | Version | Cost |
|-----------|-----------|---------|------|
| Framework | React | 18+ | Free |
| Language | TypeScript | 5.0+ | Free |
| Build Tool | Vite | 5.0+ | Free |
| Styling | Tailwind CSS | 3.4+ | Free |
| State | Zustand | 4.5+ | Free |
| Routing | React Router | 6.23+ | Free |
| HTTP | Axios | 1.7+ | Free |
| Charts | D3.js + Recharts | 7.9+ | Free |
| Icons | Lucide React | 0.400+ | Free |

### AI/ML (Anushka's Stack)

| Component | Technology | Hosting | Cost |
|-----------|-----------|---------|------|
| Agent Framework | LangGraph | Local/Docker | Free |
| Primary LLM | Llama 3.1 70B | Groq API | Free (1M tokens/day) |
| Triage LLM | Llama 3.2 3B | Local (Ollama) | Free |
| Embeddings | BGE-M3 | Self-hosted | Free |
| Reranker | BGE-Reranker | Self-hosted | Free |
| Text-to-SQL | defog/sqlcoder-7b-2 | Self-hosted (vLLM) | Free |
| Translation | AI4Bharat IndicTrans2 | Self-hosted | Free |
| ASR | Whisper (OpenAI) | Local | Free |
| TTS | Web Speech API | Browser | Free |
| Prediction | Prophet + LightGBM | Local | Free |

### Infrastructure

| Component | Technology | Cost |
|-----------|-----------|------|
| Database | Supabase (PostgreSQL + pgvector) | Free tier |
| Graph DB | Neo4j Aura (Cloud) | Free tier (200K nodes) |
| Storage | Supabase Storage / MinIO | Free |
| Hosting (Frontend) | Vercel | Free |
| Hosting (Backend) | Render / Railway | Free tier |
| GPU (optional) | Google Colab (T4) | Free |

---

## Appendix C: Database Schema Reference

### PostgreSQL Tables (Supabase)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `assets` | Master equipment registry | uat (PK), plant_code, equipment_type, status |
| `documents` | Document metadata | doc_id (PK), uat (FK), doc_type, file_hash, commit_hash |
| `work_orders` | Maintenance records | wo_id (PK), uat (FK), wo_type, status |
| `inspections` | Inspection reports | inspection_id (PK), uat (FK), severity |
| `failure_events` | Failure events for RCA | failure_id (PK), uat (FK), failure_mode, root_cause |
| `alarm_history` | DCS/SCADA alarms | alarm_id (PK), uat (FK), tag_name, triggered_at |
| `compliance_records` | Regulatory compliance | record_id (PK), uat (FK), regulation, status |
| `sensor_data` | Time-series sensor readings | reading_id, uat (FK), sensor_tag, recorded_at |
| `engineering_change_record` | Immutable audit trail | commit_id (PK), commit_hash, parent_hash, action |
| `expert_feedback` | DPO+LoRA training data | feedback_id (PK), query, ai_response, correction |
| `query_audit_log` | Query audit trail | log_id (PK), session_id, query_text, response_json |
| `users` | User accounts + RBAC | user_id (PK), email, role, plant_access |
| `document_embeddings` | Vector embeddings | embedding_id (PK), doc_id (FK), chunk_text, embedding |
| `asset_dependencies` | Equipment relationships | dependency_id (PK), parent_uat, child_uat, type |
| `asset_expertise` | Engineer knowledge mapping | expertise_id (PK), person_id, uat, level |

### Neo4j Graph Schema

See Phase 7 for complete node types, relationship types, and Cypher queries.

---

## Appendix D: Agent Architecture

### Agent System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    LANGGRAPH SUPERVISOR                          │
│         (State Machine + Router + Synthesizer)                  │
│  State: {query, intent, context, retrieved_docs, answer}       │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  QUERY AGENT  │   │  RCA AGENT    │   │  PREDICTIVE   │
│  (RAG Mode)   │   │  (Root Cause) │   │  MAINTENANCE  │
│               │   │               │   │    AGENT      │
│ • Hybrid RAG  │   │ • Causal Chain│   │ • Failure Prob│
│ • Citations   │   │ • Evidence    │   │ • RUL Estimate│
│ • Source      │   │   Ranking     │   │ • Schedule    │
│   Attribution │   │               │   │   Recommend   │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
              ┌─────────────────────────┐
              │   ASSET NETWORK AGENT   │
              │ (Dependencies + Impact)  │
              └─────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  COMPLIANCE AGENT       │
              │ (Gap + Audit Package)   │
              └─────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   SYNTHESIS AGENT       │
              │ (Response Assembler)     │
              └─────────────────────────┘
```

### Agent Development Priority

| Priority | Agent | Why First? | Estimated Time |
|----------|-------|-----------|---------------|
| P0 | Query Agent (RAG) | Core functionality, most queries | 4-6 hours |
| P1 | RCA Agent | Highest hackathon differentiator | 4-6 hours |
| P2 | Supervisor (Router + Synthesis) | Needed to connect all agents | 2-3 hours |
| P3 | Predictive Agent | Adds "future" intelligence | 3-4 hours |
| P4 | Asset Network Agent | Visualization wow factor | 2-3 hours |
| P5 | Compliance Agent | Nice to have, can be mocked | 2-3 hours |

---

## Appendix E: Cost Analysis

### Free / Open-Source (Majority of Stack)

| Component | Technology | Cost |
|-----------|-----------|------|
| Primary LLM | Llama 3.1 70B (Groq free tier) | 0 |
| Triage LLM | Llama 3.2 3B (local) | 0 |
| Text-to-SQL | defog/sqlcoder-7b-2 | 0 |
| Translation | AI4Bharat IndicTrans2 | 0 |
| ASR | Whisper (local) | 0 |
| Embeddings | BGE-M3 | 0 |
| Reranker | BGE-Reranker | 0 |
| Vector DB | pgvector | 0 |
| Graph DB | Neo4j Community | 0 |
| Object Storage | MinIO | 0 |
| Cache | Redis | 0 |
| Frontend | React + D3.js | 0 |
| API Framework | FastAPI | 0 |

### Potential Costs (Optional)

| Component | Cost | When Needed |
|-----------|------|-------------|
| GPU Cloud (RunPod/TensorDock) | 50-150/hr | Demo day only |
| Deepgram STT | 0.0043/min | Free tier: 200 min/month |
| AWS Bedrock (backup) | $3/1M tokens | Avoid — use open source |

### Hackathon Budget Estimate

| Scenario | Cost | How |
|----------|------|-----|
| Bare Minimum | 0 | Everything local, CPU models |
| Recommended | 500-2,000 | GPU cloud for demo day |
| Full Production | 10,000-30,000/month | Managed AWS/GCP services |

### Free Credits Available

| Platform | Free Credits | How to Get |
|----------|-------------|------------|
| AWS Activate | $1,000-$10,000 | Startup/hackathon registration |
| Google Cloud | $300 + $3,000 | New account + startup program |
| Azure | $200 + $150,000 | Visual Studio subscription |
| Groq | 1M tokens/day | Free tier signup |
| Deepgram | $200 | Developer account |
| Neo4j Aura | 200K nodes | Free cloud instance |
| Supabase | 500MB | Free tier |

---

## Today's Target (Right Now)

**Phase 0 + Phase 1 Step 1.1 only.**

```bash
# 1. Folder structure
cd C:\AIML\ForTrace
mkdir backend\app\api\v1\endpoints
mkdir backend\app\core
mkdir backend\app\models
mkdir backend\app\services
mkdir backend\app\utils

# 2. Virtual environment
cd backend
python -m venv venv
venv\Scripts\activate

# 3. Dependencies
pip install fastapi uvicorn[standard] sqlalchemy asyncpg pydantic pydantic-settings python-dotenv python-jose[cryptography] passlib[bcrypt] python-multipart supabase neo4j

# 4. Create core files
# app/core/config.py
# app/core/database.py
# app/main.py
# app/api/v1/router.py
# app/api/v1/endpoints/auth.py

# 5. Run
uvicorn app.main:app --reload
```

**Test:** `http://localhost:8000/docs` → Swagger UI visible.

**Do NOT proceed to Phase 2 until Phase 0 + Phase 1.1 are fully tested and working.**

---

## Daily Checklist Template

Copy this for each day:

```markdown
## Day X — Date: ___

### Today's Phases: ___

### Completed:
- [ ] Step __.__
- [ ] Step __.__

### Blockers:
- ___

### Tomorrow's Plan:
- ___

### Notes:
- ___
```

---

> **Remember:** This is a STARTUP, not a hackathon. Every line of code must be production-grade. Test every phase before moving forward. No shortcuts.
