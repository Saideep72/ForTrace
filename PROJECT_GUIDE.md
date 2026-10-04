# ForTrace — Industrial Knowledge Intelligence Platform

## Comprehensive Project Guide & Evaluation Document

**Built by Team Arise**

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Our Solution — ForTrace](#2-our-solution--fortrace)
3. [System Architecture](#3-system-architecture)
4. [End-to-End Workflow](#4-end-to-end-workflow)
5. [Backend Deep Dive](#5-backend-deep-dive)
6. [Frontend Deep Dive](#6-frontend-deep-dive)
7. [Multi-Agent AI Orchestration (LangGraph)](#7-multi-agent-ai-orchestration-langgraph)
8. [Security & TEE Shield](#8-security--tee-shield)
9. [Database Schema & Data Model](#9-database-schema--data-model)
10. [API Reference](#10-api-reference)
11. [Role-Based Access Control (RBAC)](#11-role-based-access-control-rbac)
12. [Unique & Differentiating Features](#12-unique--differentiating-features)
13. [Technology Stack](#13-technology-stack)
14. [Setup & Deployment](#14-setup--deployment)
15. [Testing & Verification](#15-testing--verification)

---

## 1. Problem Statement

India's heavy industries — refineries, chemical plants, power stations, and manufacturing facilities — face a convergence of three critical, systemic failures:

### 1.1 Retiring Engineers, Vanishing Knowledge

Decades of tacit engineering expertise — the unwritten rules, operational intuitions, and failure-mode knowledge accumulated over 30+ year careers — walk out the door when senior engineers retire. There is **no system to capture it**. This knowledge exists only in the minds of veteran field technicians and is lost permanently upon their departure.

> *"When a senior operator with 35 years of experience retires, we lose the ability to diagnose problems that don't appear in any manual."*

### 1.2 Cascading Failures Without Warning

Modern industrial plants operate as deeply interconnected networks. A single tripped asset (e.g., a heat exchanger fouling shutdown) can cascade downstream and bring **5+ interconnected systems** offline within minutes. Plant operators today have **no predictive visibility** into these cascading dependency chains before a failure actually occurs.

### 1.3 Accidents are Routine, Not Rare

Industrial accidents in India are not edge cases — they are systemic:
- **1 serious industrial accident occurs every 2 days** in India
- **400+ fatalities and 850+ injuries in 2024 alone**
- Most incidents stem from operators not having immediate access to the right SOP, the right safety procedure, or the right institutional knowledge at the right moment

### The Core Gap

There is no single platform that:
- Digitizes and preserves tacit engineering knowledge before it's lost
- Maps the physical interdependency topology of plant assets
- Provides AI-driven, context-aware answers grounded in actual plant documentation
- Simulates "what-if" cascade failures before they happen
- Delivers safety-critical information in the operator's native language (Hindi/Hinglish)
- Maintains cryptographically verifiable audit trails for regulatory compliance

**ForTrace was built to fill this gap.**

---

## 2. Our Solution — ForTrace

ForTrace is a **production-grade, AI-powered Industrial Knowledge Intelligence Platform** designed for plant managers, maintenance engineers, safety officers, field technicians, auditors, and domain experts.

It combines **six core capabilities** into a unified system:

### 2.1 AI-Powered Document Digitization & OCR

ForTrace automatically ingests legacy paper-based engineering documents — SOPs, P&ID diagrams, OEM manuals, inspection reports, incident logs — and extracts their full text content through a multi-format extraction engine supporting:
- **PDF** parsing (PyPDF2)
- **Image/Blueprint OCR** (Tesseract)
- **Audio transcription** of field engineer voice notes (Groq Whisper Large V3)
- **DOCX/ZIP** archive extraction

This ensures decades of accumulated operational knowledge is digitized, searchable, and permanently preserved.

### 2.2 2-Tier Hybrid Named Entity Recognition (NER)

An intelligent NER engine automatically identifies and extracts critical operational data from every document:
- **Equipment tags** (e.g., `R-101`, `P-201-A`, `E-201`)
- **Operating thresholds** (temperatures, pressures, flow rates)
- **Part numbers**, **dates**, **regulations** (ISO 9001, OSHA 1910)
- **Failure modes** and **safety procedures**

The system operates in two tiers:
- **Tier 1 (Cloud LLM)**: High-accuracy extraction via Groq Llama-3.3-70B
- **Tier 2 (Offline Regex)**: Zero-API-call fallback using industrial-grade regex patterns — runs indefinitely even without internet

### 2.3 Context-Aware Semantic Search (RAG)

Extracted document chunks are embedded into a **1024-dimensional vector space** using the locally-hosted BGE-Large-EN-v1.5 model and stored in **pgvector** (PostgreSQL vector extension). This powers:
- Natural language queries against the entire technical documentation corpus
- Cosine similarity ranking of results
- UAT-filtered search (restrict results to a specific physical asset)
- Configurable similarity thresholds and result limits

### 2.4 Multilingual Translation for Ground-Level Safety

Built-in bilingual support bridges the communication gap between English-language documentation and Hindi/Hinglish-speaking field technicians:
- **Language Detection**: Automatically detects if a query is in Hindi (Devanagari or Romanized Hinglish) or English
- **Hindi to English Translation**: Translates operator queries for AI processing
- **English to Hindi Translation**: Returns answers in the operator's native language
- **Technical Tag Preservation**: Equipment tags like `R-101`, `P-201` are preserved exactly as-is during translation

### 2.5 Dynamic Interdependency & Topology Mapping

An interactive **Vis.js network graph** visualizes the entire plant topology:
- Physical assets (boilers, pumps, heat exchangers, compressors, reactors)
- Document nodes linked to their parent assets
- Failure events, work orders, inspections, and active alarms
- Directional dependency edges showing upstream/downstream relationships
- **Causal path tracing**: Click any node to highlight its dependency chain while dimming unrelated nodes

### 2.6 What-If Cascade Failure Stress Simulator (Digital Twin)

A predictive **BFS-based blast-radius simulation engine** that:
- Accepts a source asset and failure scenario (fouling, thermal runaway, vibration trip, power failure)
- Traverses the asset dependency graph using breadth-first search (up to 4 hops)
- Computes downstream cascade chains with estimated **minutes-to-impact** per flow type
- Calculates **total financial exposure** (hourly, daily, weekly downtime costs) based on cumulative criticality ratings
- Returns emergency containment SOP recommendations

---

## 3. System Architecture

ForTrace follows a **4-layer architecture** with clean separation of concerns:

```
+-----------------------------------------------------------------------------+
|                         LAYER 1: INGESTION LAYER                            |
|                                                                             |
|  Failure Logs    SOPs/Manuals    Audio/Voice Notes    Sensor/Alarm Logs     |
|  (Web Form)      (PDF/DOCX)      (WAV/MP3)           (CSV/JSON)            |
|         |              |              |                     |                |
|         +--------------+--------------+                     |                |
|                        v                                    v                |
|               Schema Validator              Asset UAT Normalizer            |
+------------------------+----------------------------------------+-----------+
                         |                                        |
+------------------------v----------------------------------------v-----------+
|                    LAYER 2: PROCESSING & EXTRACTION LAYER                    |
|                                                                              |
|    PyPDF2        Tesseract OCR      Whisper STT      DOCX/ZIP Parser        |
|   (PDF Text)    (Image/Blueprint)   (Audio->Text)    (Text Decode)          |
|         |              |                 |                |                  |
|         +--------------+-----------------+----------------+                  |
|                                |                                             |
|                    512-Token Sentence-Aware Chunker                          |
|                                |                                             |
|                    BGE-Large-EN-v1.5 Embedding (1024D)                      |
|                                |                                             |
|                    2-Tier Hybrid NER (Groq LLM / Regex)                     |
+--------------------------------+---------------------------------------------+
                                 |
+--------------------------------v---------------------------------------------+
|                  LAYER 3: KNOWLEDGE & DATA PERSISTENCE LAYER                 |
|                                                                              |
|  PostgreSQL        pgvector        Supabase Storage    Knowledge Graph       |
|  (OLTP Core)      (Vector DB)     (Object Store)      (Unified Links)       |
|                                                                              |
|  Users, Assets     Chunk Text      Raw PDFs            Asset UAT <-> WO     |
|  Failure Events    1024D Vectors   WAV Audio           <-> Failure Case     |
|  Work Orders       HNSW Index      CSV Logs            <-> Document         |
|  Documents                         Wisdom TXT          <-> Alarm            |
|  Entities, Deps                                                              |
|  Audit Logs                                                                  |
+--------------------------------+---------------------------------------------+
                                 |
+--------------------------------v---------------------------------------------+
|             LAYER 4: AGENTIC ORCHESTRATION & SECURITY LAYER                  |
|                                                                              |
|  +-----------------------------------------------------------------------+  |
|  |          TRUSTED EXECUTION ENVIRONMENT (TEE) SHIELD                   |  |
|  |  - Redacts sensitive IP, asset tags, emails before cloud LLM API      |  |
|  |  - AMD SEV-SNP cryptographic enclave attestation                      |  |
|  |  - Re-injects real identifiers during post-processing                 |  |
|  +-----------------------------+-----------------------------------------+  |
|                                v                                             |
|            MULTI-AGENT SUPERVISOR (LANGGRAPH ROUTER)                        |
|                                                                              |
|   Query Agent    RCA Agent    Predictive Agent    Network Agent              |
|   (Semantic      (Failure     (Health             (Topology &                |
|    RAG Search)    Diagnostics) Prediction)         Dependencies)             |
|                                                                              |
|   Out-of-Scope Agent -- Rejects non-plant queries without wasting API calls |
+------------------------------------------------------------------------------+
```

---

## 4. End-to-End Workflow

### Workflow 1: Document Knowledge Capture

```
User uploads PDF/DOCX/Image/Audio
         |
         v
  File stored in Supabase Object Storage (indra-assets bucket)
  Document metadata registered in PostgreSQL (documents table)
         |
         v
  User triggers "Process Text" extraction
         |
         +-- PDF --> PyPDF2 native text extraction
         +-- Image --> Tesseract OCR scan
         +-- Audio --> Groq Whisper STT transcription
         +-- DOCX --> XML word/document.xml parsing
         |
         v
  Raw text --> 512-token sentence-aware chunking (64-token overlap)
         |
         v
  Chunks --> BGE-Large-EN-v1.5 --> 1024D dense vector embeddings
  Stored in document_embeddings table with pgvector HNSW indexing
         |
         v
  Chunks --> 2-Tier NER (Groq LLM primary / Regex fallback)
  Extracted entities --> extracted_entities table
  (Equipment tags, temperatures, pressures, flow rates, dates, regulations)
```

### Workflow 2: AI Agent Query Processing

```
User types or speaks a question (English or Hindi/Hinglish)
         |
         +-- Text input --> direct to pipeline
         +-- Voice input --> Groq Whisper STT --> transcription
                |
                v
         Language Detection (Groq LLM)
                |
         +------+------+
         | Hindi/      | English
         | Hinglish    |    |
         |      |      |    |
         |  Translate   |   |
         |  to English  |   |
         +------+------+   |
                |           |
                v           v
         TEE Shield: Anonymize (mask asset tags, emails)
                |
                v
         Supervisor Agent (LangGraph Router)
         Classifies intent --> routes to specialized agent
                |
         +------+----------+----------+-----------+
         v      v          v          v           v
      Query   RCA     Predictive  Network    Out-of-Scope
      Agent   Agent     Agent      Agent       Agent
         |      |          |          |           |
         v      v          v          v           v
     Vector  Failure   Sensor     Topology    Polite
     Search  History   Analysis   Traversal   Rejection
     + RAG   + Alarms  + Drift    + Deps
         |      |          |          |
         +------+----------+----------+
                        |
                        v
         TEE Shield: De-anonymize (restore real tags)
                        |
                        v
         Confidence Scoring Engine (heuristic 0.0 - 1.0)
                        |
                        v
         If original query was Hindi:
           --> Translate response to Hindi
           --> Generate bilingual TTS spoken summary
                        |
                        v
         Final response delivered to UI with:
           - Full answer text
           - Confidence score
           - Agent name that handled it
           - TEE attestation logs
           - Short spoken summary (English + Hindi)
```

### Workflow 3: Cascade Failure Simulation

```
User selects source asset + failure scenario on Network Analysis page
         |
         v
  POST /api/v1/simulation/cascade-trip
         |
         v
  Verify source asset exists in PostgreSQL assets table
         |
         v
  Fetch all asset_dependencies (source_uat --> target_uat relationships)
  Build adjacency map of the plant topology
         |
         v
  BFS traversal from source_uat (max depth: 4 hops)
  For each downstream node:
    - Calculate minutes_to_impact based on flow_type
      (steam: 5min, electrical: 2min, fuel_gas: 3min, process_fluid: 8min)
    - Record cascade depth, parent_uat, relationship_type
         |
         v
  Fetch asset details for each blast radius node
  Sum total criticality ratings
         |
         v
  Financial Exposure = total_criticality x $2,500/hour
  Calculate hourly, daily, and weekly loss estimates
         |
         v
  Return blast_radius_details sorted by minutes_to_impact
  + source asset profile + financial_exposure summary
  + emergency containment SOP recommendations
```

---

## 5. Backend Deep Dive

The backend is a **FastAPI** (Python 3.10+) REST API gateway organized into clean, modular layers.

### 5.1 Application Entry Point (app/main.py)

- Initializes FastAPI with project metadata and lifespan context manager
- Configures CORS middleware for local development (ports 5173, 8080, 3000, 8000)
- Registers all versioned API routes under `/api/v1`
- Exposes `/health` endpoint for database connectivity checks

### 5.2 Core Infrastructure (app/core/)

| File | Purpose |
|---|---|
| `config.py` | Pydantic Settings model loading from `.env` (Supabase URLs, JWT secrets, token expiry) |
| `database.py` | Supabase client initialization and connection pool management |
| `security.py` | JWT creation/validation, bcrypt password hashing, OAuth2 bearer scheme, token revocation blacklist, `require_role()` RBAC decorator |

### 5.3 Services Layer (app/services/)

| Service | File | Purpose |
|---|---|---|
| **Extraction** | `extraction_service.py` | Multi-format text extraction (PDF, Image OCR, Audio STT, DOCX, ZIP archives), 512-token chunking with 64-token overlap |
| **Embedding** | `embedding_service.py` | Lazy-loaded BGE-Large-EN-v1.5 SentenceTransformer, single/batch 1024D vector generation |
| **NER** | `ner_service.py` | 2-tier hybrid NER: Tier 1 Groq LLM structured extraction, Tier 2 Industrial regex patterns for equipment tags, temperatures, pressures, flow rates, part numbers, dates, regulations |
| **Translation** | `translation_service.py` | Bidirectional Hindi-English translation via Groq Llama-3.3-70B with industrial terminology specialization |
| **TEE Simulator** | `tee_simulator.py` | AMD SEV-SNP enclave simulation: anonymizes asset tags and emails before cloud API calls, de-anonymizes responses, generates cryptographic attestation reports |

### 5.4 API Endpoints (app/api/v1/endpoints/)

| Router | Prefix | Endpoints |
|---|---|---|
| **Authentication** | `/auth` | Login (OAuth2 password flow), Register, Logout (token revocation), Token refresh |
| **Assets** | `/assets` | CRUD for physical plant assets, asset listing with filters |
| **Documents** | `/documents` | Upload (multipart), List with pagination, Soft-delete, Process (trigger extraction pipeline) |
| **Search** | `/search` | Semantic cosine similarity search over document embeddings |
| **Entities** | `/entities` | Retrieve extracted NER entities by document |
| **Graph** | `/graph` | Full plant topology (assets, documents, dependencies, failures, work orders, inspections, alarms), node neighbor lookup |
| **Reports** | `/reports` | RCA PDF generation (ReportLab), Compliance certificate PDF, Engineering Change Records (Merkle-hashed), Immutable audit logs |
| **Expert** | `/expert` | Expert wisdom submission/retrieval, Failure case review, Expert account provisioning (Admin only) |
| **Simulation** | `/simulation` | Cascade trip BFS simulator, Asset list for simulator dropdown |
| **Query** | `/query` | AI agent chat (text + voice), bilingual processing, session memory, TEE integration, TTS summary generation |

---

## 6. Frontend Deep Dive

The frontend is a **React 18** single-page application built with **Vite**, using **Framer Motion** for animations, **Lucide React** for icons, **Vis.js** for network graphs, **Recharts** for data visualizations, and **React Router v6** for navigation.

### 6.1 Pages

| Page | File | Features |
|---|---|---|
| **Login** | `Login.jsx` | Animated login/register form, demo account quick-select, role-based credential preloading |
| **Home** | `Home.jsx` | Hero section, live statistics dashboard (asset count, document count, alarm count), platform section cards with data flow callout overlays |
| **Documents Dashboard** | `DocumentsDashboard.jsx` | Document catalog grid with pagination, category images, upload modal (title, UAT, type, revision, compliance, file drag-and-drop), expanded detail view with NER entity table, RAG vector search interface |
| **AI Agent Chat** | `AIChat.jsx` | Conversational AI interface with text/voice input, bilingual support, TEE attestation logs, confidence score display, agent routing indicator, TTS audio playback, session memory |
| **Network Analysis** | `NetworkAnalysis.jsx` | Interactive Vis.js plant topology graph, search/filter controls, depth selector, node click to neighbor detail popover, cascade stress tester UI with scenario selection and blast radius results |
| **Reports & Audit** | `ReportsAudit.jsx` | Engineering Change Record viewer, failure event listing, RCA PDF download, compliance certificate generation, immutable audit log display |
| **Expert Advice** | `ExpertAdvice.jsx` | Failure case review dashboard, expert wisdom submission form (root cause verdicts, maintenance checklists, tribal knowledge notes), admin provisioning modal |
| **Settings** | `Settings.jsx` | Profile management, security settings (2FA, sessions), notification preferences, appearance settings, plant preferences, AI configuration |
| **System Console** | `SystemConsole.jsx` | Real-time API response log viewer for debugging and system monitoring |

### 6.2 Shared Components

| Component | Purpose |
|---|---|
| `HeaderBar.jsx` | Sticky top navigation with logo, role-based tab visibility, dynamic Login/Logout toggle |
| `HeroSection.jsx` | Animated hero banner with platform statistics |
| `AssetCard.jsx` | Compact asset summary card |
| `AssetDetailPanel.jsx` | Expanded asset detail view with document upload capability |
| `CausalGraph.jsx` | D3-based causal relationship graph |
| `RBACBadge.jsx` | Role indicator badge component |
| `FailureTable.jsx` | Tabular failure event display |

### 6.3 Utilities (utils.js)

- `apiFetch()` — Centralized API client with JWT bearer token injection, 401 auto-logout, PDF blob handling, request/response logging
- `handleLogout()` — Clears all session tokens and redirects to login
- `getUserRole()` — Extracts role from JWT payload (supports multiple claim locations)
- `hasAccess()` — RBAC visibility check against the role-view matrix
- `RBAC_MAP` — Role-to-view authorization matrix
- `apiLogs` / `addApiLog()` — In-memory API response log buffer for System Console

---

## 7. Multi-Agent AI Orchestration (LangGraph)

ForTrace uses **LangGraph** (by LangChain) to build a compiled, stateful multi-agent workflow graph.

### 7.1 Graph State

```python
class GraphState(TypedDict):
    query: str                           # User's natural language input
    intent: Optional[str]                # Classified routing intent
    retrieved_context: dict              # Context from Vector/SQL/Graph databases
    current_agent: Optional[str]         # Currently active agent
    response: Optional[str]              # Final natural language response
    confidence: Optional[float]          # Self-assessed confidence (0.0 - 1.0)
    include_expert_advice: Optional[bool]# Toggle for expert wisdom in RAG
    messages: List[BaseMessage]          # Conversation history (append-only)
```

### 7.2 Agent Roles

| Agent | Routing Intent | Specialization | Data Sources |
|---|---|---|---|
| **Supervisor** | Entry point | Classifies user intent using structured LLM output, routes to specialized agent. Includes regex-based fast-path for out-of-scope queries. | N/A |
| **QueryAgent** | `QueryAgent` | General informational queries about equipment, SOPs, regulations, documents | pgvector semantic search, document embeddings, expert wisdom notes |
| **RCAAgent** | `RCAAgent` | Root cause analysis: why is X failing/tripping/overheating | Failure events, alarm history, work orders, maintenance records |
| **PredictiveAgent** | `PredictiveAgent` | Predictive maintenance: predict health/remaining life of X | Sensor data, alarm patterns, work order frequency, criticality ratings |
| **NetworkAgent** | `NetworkAgent` | Asset network queries: what is connected to X / upstream / downstream | Asset dependencies, topology graph, live asset status |
| **OutOfScopeAgent** | `OutOfScopeAgent` | Politely rejects non-plant queries (movies, recipes, general knowledge) | N/A |

### 7.3 LLM Configuration

ForTrace uses a **cascading fallback LLM chain** for resilience:

| Priority | Model | Provider | Purpose |
|---|---|---|---|
| Primary | **Llama-3.3-70B-Versatile** | Groq | High-accuracy RAG synthesis, RCA, NER, routing |
| Fallback 1 | **Qwen-2.5-32B** | Groq | Secondary capacity when primary hits rate limits |
| Fallback 2 | **Mixtral-8x7B-32768** | Groq | Third-tier fallback |
| Fallback 3 | **Llama-3-8B-8192** | Groq | Lightweight emergency fallback |

The `LLMWithFallbackWrapper` class intercepts HTTP 429 rate limit errors and automatically shifts to the next model in the chain, ensuring uninterrupted service.

### 7.4 Confidence Scoring Engine

Every agent response is scored by a **heuristic confidence engine** (`confidence.py`) that evaluates:

- **Base score per agent type** (QueryAgent: 0.55, RCAAgent: 0.60, NetworkAgent: 0.65)
- **Vector search bonus** (+0.12 for real RAG chunks, -0.05 for mock data)
- **SQL/Graph data bonus** (+0.08 for structured DB results)
- **Network context bonus** (+0.05 for live asset details)
- **Response quality signals** (+0.02 per grounding phrase like "according to the SOP", -0.06 per uncertainty phrase like "I don't know")
- **Response length bonus** (+0.04 for responses over 300 chars, -0.10 for under 50 chars)

Final score is clamped to `[0.05, 1.0]`.

---

## 8. Security & TEE Shield

### 8.1 Authentication

- **JWT (JSON Web Tokens)** with HS256 signing
- **bcrypt** password hashing via Passlib
- **OAuth2 Password Bearer** flow for login
- **Token revocation blacklist** — logged-out tokens are stored in `revoked_tokens` table and checked on every request
- **Configurable token expiry** (default: 30 minutes)

### 8.2 Trusted Execution Environment (TEE) Simulator

Before any user query reaches the external cloud LLM API, it passes through the **TEE Shield** — a simulation of AMD SEV-SNP hardware enclaves:

1. **Anonymization Phase**: Regex-based detection and masking of:
   - Asset tags (e.g., `E-201` becomes `[ASSET_0]`)
   - Email addresses (e.g., `user@plant.com` becomes `[USER_EMAIL_0]`)
   - Mappings stored in encrypted in-memory registry

2. **Cloud API Call**: The anonymized, sanitized text is sent to Groq's LLM API

3. **De-anonymization Phase**: Placeholders in the LLM response are replaced with original identifiers

4. **Attestation Report**: Cryptographic report generated with:
   - Unique enclave ID
   - SHA-256 measurement hash
   - Verification status (`VERIFIED_AMD_SEV_SNP`)
   - Timestamp and signature

This ensures **zero proprietary plant data leaks** to external cloud services.

### 8.3 Role-Based Access Control

Every API endpoint is protected by `get_current_user` (JWT validation) and optionally by `require_role()` which restricts access to specific roles. The frontend mirrors these restrictions by hiding navigation tabs, action buttons, and feature panels based on the user's JWT-embedded role claim.

---

## 9. Database Schema & Data Model

ForTrace uses **Supabase PostgreSQL** with the **pgvector** extension. Key tables:

| Table | Purpose | Key Columns |
|---|---|---|
| `users` | User accounts | `user_id`, `email`, `password_hash`, `role`, `full_name`, `is_active` |
| `assets` | Physical plant equipment | `uat` (PK), `equipment_tag`, `equipment_type`, `status`, `criticality_rating`, `manufacturer`, `is_active` |
| `asset_dependencies` | Equipment relationships | `source_uat`, `target_uat`, `relationship_type`, `dependency_type`, `flow_type`, `criticality` |
| `documents` | Uploaded technical documents | `doc_id`, `uat` (FK), `title`, `doc_type`, `file_path`, `file_hash`, `revision`, `compliance_scope`, `uploaded_by` |
| `document_embeddings` | Vector chunks | `embedding_id`, `doc_id` (FK), `chunk_index`, `chunk_text`, `chunk_metadata` (JSONB), `embedding` (vector 1024) |
| `extracted_entities` | NER results | `entity_id`, `doc_id` (FK), `entity_type`, `entity_value`, `start_char`, `end_char`, `confidence` |
| `failure_events` | Equipment failures | `failure_id`, `uat`, `failure_mode`, `failure_category`, `severity`, `occurrence_date`, `root_cause`, `downtime_hours`, `financial_loss_inr` |
| `work_orders` | Maintenance orders | `wo_id`, `uat`, `wo_type`, `priority`, `description`, `status` |
| `alarm_history` | DCS alarm records | `alarm_id`, `uat`, `tag_name`, `alarm_type`, `alarm_priority`, `triggered_at` |
| `inspections` | Equipment inspections | `inspection_id`, `uat`, `inspection_type`, `findings`, `severity` |
| `engineering_change_record` | Merkle-hashed ECRs | `ecr_id`, `change_description`, `hash`, `previous_hash`, `approved_by` |
| `refresh_tokens` | JWT refresh tokens | `token_id`, `user_id`, `token`, `expires_at`, `is_revoked` |
| `revoked_tokens` | JWT blacklist | `token` (PK), `revoked_at` |

### pgvector Similarity Search Function

```sql
CREATE FUNCTION match_embeddings(
  query_embedding vector(1024),
  match_threshold float,
  match_count int,
  filter_uat text DEFAULT NULL
) RETURNS TABLE (
  embedding_id uuid, doc_id uuid, chunk_index int,
  chunk_text text, chunk_metadata jsonb, similarity float
)
-- Uses cosine distance: similarity = 1 - (embedding <=> query_embedding)
-- Filtered by optional UAT, ordered by similarity, limited to match_count
```

---

## 10. API Reference

**Base URL**: `http://localhost:8000/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | OAuth2 password login, returns JWT access + refresh tokens |
| `POST` | `/auth/register` | Create new user account |
| `POST` | `/auth/logout` | Revoke access token |
| `GET` | `/assets` | List all active assets |
| `GET` | `/documents?limit=N` | List documents (paginated) |
| `POST` | `/documents/upload` | Upload document (multipart form) |
| `POST` | `/documents/process/{doc_id}` | Trigger OCR, chunk, embed, NER pipeline |
| `DELETE` | `/documents/{doc_id}` | Soft-delete document |
| `POST` | `/search/semantic` | Cosine similarity vector search |
| `GET` | `/entities/document/{doc_id}` | Get NER entities for a document |
| `GET` | `/graph/topology` | Full plant network topology |
| `GET` | `/graph/neighbors/{node_id}` | Node neighbor details |
| `POST` | `/reports/rca` | Generate RCA PDF report |
| `POST` | `/reports/compliance-certificate` | Generate compliance PDF |
| `GET` | `/reports/engineering-changes` | List Merkle-hashed ECRs |
| `GET` | `/reports/audit-logs` | Immutable audit trail |
| `GET` | `/expert/failure-cases` | List failure cases for expert review |
| `POST` | `/expert/wisdom` | Submit expert wisdom note |
| `GET` | `/expert/wisdom/{uat}` | Get expert wisdom for an asset |
| `POST` | `/simulation/cascade-trip` | Run cascade failure simulation |
| `GET` | `/simulation/assets-list` | Get assets available for simulation |
| `POST` | `/query/ask` | AI agent query (text) |
| `POST` | `/query/voice` | AI agent query (voice upload) |
| `GET` | `/health` | System health check |

---

## 11. Role-Based Access Control (RBAC)

| Role | Authorized Views | System Capabilities |
|---|---|---|
| **Plant Manager** | Home, Documents, AI Chat, Network, Reports & Audit, Expert Advice | Full admin access, ECR approvals, Expert provisioning, all uploads/deletes |
| **Maintenance Engineer** | Home, Documents, AI Chat, Network Analysis | Asset management, SOP uploads, Work order tracking |
| **Expert Engineer** | Home, AI Chat, Network Analysis, Expert Advice | Submit expert wisdom dossiers, review failure cases, add verdicts |
| **Field Technician** | Home, AI Chat, Network Analysis | Read-only topology view, voice queries in Hindi/English, SOP search |
| **Auditor** | Home, Network Analysis, Reports & Audit | View compliance records, change ledgers, audit logs (read-only) |
| **Safety Officer** | Home, AI Chat, Network Analysis, Reports & Audit | Safety procedure queries, alarm history review, compliance checks |
| **System Admin** | All views + System Console | Full administrative controls, user management, system monitoring |

---

## 12. Unique & Differentiating Features

### 12.1 Not Just Another AI Chatbot

ForTrace is **not a generic LLM wrapper**. Unlike consumer chatbots:
- Every response is grounded in **actual plant documentation** via RAG vector search
- Responses include a transparent **confidence score** (0.0-1.0)
- The **TEE Shield** ensures zero proprietary data leaks to external APIs
- An **out-of-scope agent** actively rejects non-plant queries without wasting API calls

### 12.2 Tribal Knowledge Preservation

The **Expert Advice** module is purpose-built for capturing institutional knowledge from retiring senior engineers:
- Structured wisdom submission forms tied to specific failure cases and assets
- Peer-reviewable verdicts and maintenance checklists
- Expert notes are embedded into the RAG vector database, making tribal knowledge **searchable by AI forever**

### 12.3 Digital Twin Stress Testing

The **What-If Cascade Simulator** is a unique capability not found in standard industrial management systems:
- BFS-based blast-radius computation over the real asset dependency graph
- Flow-type-aware cascade timing (steam cascades in 5 minutes, electrical in 2 minutes)
- Financial exposure quantification ($2,500 x criticality x hours)
- Emergency SOP recommendations

### 12.4 Bilingual Voice Pipeline

Full **Hindi/Hinglish support** across the entire AI pipeline:
- Voice input via Whisper STT, language detection, translation, agent processing, response translation, TTS playback
- Technical equipment tags are preserved as-is across all translation steps
- This bridges the critical communication gap for field technicians who may not read English

### 12.5 Merkle-Chained Audit Trail

Every Engineering Change Record is cryptographically chained using SHA-256 hashes:
- Each record's hash includes the previous record's hash
- Creates an **immutable, tamper-evident audit chain**
- Critical for regulatory compliance (ISO 9001, OSHA, API standards)

### 12.6 2-Tier NER with Offline Fallback

The NER system works **with or without internet**:
- Tier 1 (Groq LLM) provides high-accuracy extraction when cloud APIs are available
- Tier 2 (Regex) provides unlimited, zero-cost extraction as a fallback
- Industrial-grade regex patterns for equipment tags, temperatures, pressures, flow rates, and regulatory standards

### 12.7 Multi-Model Cascading Fallback

The LLM layer never fails completely:
- Primary: Llama-3.3-70B then Fallback 1: Qwen-2.5-32B then Fallback 2: Mixtral-8x7B then Fallback 3: Llama-3-8B
- Automatic failover on HTTP 429 rate limits
- Each model is pre-configured for both standard invocation and structured output

### 12.8 Heuristic Confidence Scoring

Unlike black-box AI systems, ForTrace provides **transparent confidence assessment**:
- Multi-signal scoring based on data source quality, response grounding, and uncertainty detection
- Operators can gauge how much to trust each response
- Low-confidence answers are visually flagged in the UI

---

## 13. Technology Stack

### Backend

| Component | Technology | Purpose |
|---|---|---|
| Web Framework | **FastAPI** (Python 3.10) | REST API Gateway, async request handling |
| Database | **Supabase PostgreSQL** + **pgvector** | Relational data + vector similarity search |
| Object Storage | **Supabase Storage** (indra-assets bucket) | Binary file storage (PDFs, audio, images) |
| Embedding Model | **BGE-Large-EN-v1.5** (local) | 1024D dense vector generation |
| Primary LLM | **Llama-3.3-70B-Versatile** | RAG synthesis, RCA, NER, agent routing |
| LLM Provider | **Groq** (inference API) | Ultra-low latency LLM inference |
| Agent Framework | **LangGraph** (LangChain) | Multi-agent orchestration and state management |
| STT Engine | **Whisper Large V3 Turbo** (Groq) | Voice-to-text transcription |
| PDF Generation | **ReportLab** | Production-grade PDF report compilation |
| OCR Engine | **Tesseract** + **Pillow** | Image and blueprint text extraction |
| PDF Parsing | **PyPDF** | Native PDF text extraction |
| Auth | **python-jose** + **Passlib** (bcrypt) | JWT tokens and password hashing |
| Enclave | **TEE Simulator** (AMD SEV-SNP) | Prompt anonymization before cloud API calls |

### Frontend

| Component | Technology | Purpose |
|---|---|---|
| Framework | **React 18** | Component-based UI |
| Build Tool | **Vite 5** | Fast development server and build toolchain |
| Routing | **React Router v6** | Client-side navigation |
| Animation | **Framer Motion** | Smooth page transitions and micro-interactions |
| Icons | **Lucide React** | Consistent icon library |
| Network Graph | **Vis.js** | Interactive plant topology visualization |
| Charts | **Recharts** | Data visualization components |
| Graph Library | **D3.js** | Causal graph rendering |

---

## 14. Setup & Deployment

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Supabase project (PostgreSQL + pgvector + Object Storage)
- Groq API key
- Tesseract OCR installed (for image processing)

### Backend Setup

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:
```ini
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_KEY=<service-role-key>
SUPABASE_ANON_KEY=<anon-key>
GROQ_API_KEY=<groq-api-key>
SECRET_KEY=<jwt-secret-key>
```

Start the server:
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Swagger API docs: `http://127.0.0.1:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Database Setup

Execute the SQL migration files in Supabase SQL Editor:
1. `app/migrations.sql` — Core tables, pgvector functions, indices
2. `app/migration_add_expert_role.sql` — Expert role extensions

---

## 15. Testing & Verification

### Automated Verification
```bash
cd backend
python test_agent_network.py
```
Verifies multi-agent routing, database connectors, and LLM availability.

### Manual Test Scenarios

| Test | Steps | Expected Result |
|---|---|---|
| **Login Flow** | Use demo account `manager@plant.com` / `Manager@123` | JWT token issued, redirected to Home dashboard |
| **Document Upload** | Navigate to Documents, Upload a PDF, Process Text | File stored, text extracted, embeddings generated, NER entities extracted |
| **RAG Search** | On Documents page, enter semantic query in RAG search section | Ranked results with cosine similarity scores |
| **AI Agent (English)** | Type "What is the operating pressure of reactor R-101?" in AI Chat | Grounded response with confidence score and agent indicator |
| **AI Agent (Hindi)** | Type "R-101 ka pressure kitna hai?" | Hindi response with bilingual spoken summary |
| **Voice Query** | Click microphone, speak query | Transcription, Translation, Agent response, TTS playback |
| **Network Topology** | Navigate to Network Analysis | Interactive graph with assets, documents, alarms, and dependency edges |
| **Cascade Simulation** | Select asset, Choose scenario, Run simulation | Blast radius list, minutes-to-impact, financial exposure calculation |
| **RCA Report** | Navigate to Reports, Select failure, Download PDF | Production-grade PDF with RCA analysis, SHA-256 hash |
| **Expert Wisdom** | Login as Expert, Submit tribal knowledge note | Note saved, embedded in RAG vector database |
| **RBAC Enforcement** | Login as Field Technician, Check visible tabs | Only Home, AI Chat, Network Analysis visible |

---

> **ForTrace** transforms industrial plant operations from reactive crisis management to proactive intelligence-driven decision making — ensuring that critical knowledge is never lost, failures are anticipated before they cascade, and every operator has instant access to the right information in their language.

---

*Built by Team Arise*
