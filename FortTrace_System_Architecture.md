# FortTrace – High-Level System Architecture & Component Specifications

This document defines the production-grade system architecture, data flow pipelines, and technical component layout for **FortTrace – Industrial Knowledge Intelligence Platform**.

---

## 1. Architecture Philosophy & Design Strategy
The design of **FortTrace** is centered around the **"Preservation of Tacit Knowledge & Air-Gapped Operational Safety"** directive. Unlike generic AI wrappers or consumer chatbots, FortTrace operates as a secure, industrial-grade RAG and Multi-Agent operating system built for highly regulated process plants.

*   **OT-to-IT Knowledge Synchronization**: Seamlessly unifies physical asset UAT tags with unstructured PDFs (manuals, P&IDs), structured SQL data (work orders, alarm history), and veteran engineer field tips.
*   **Security-First Enclave Shielding**: Sensitive IP, proprietary engineering procedures, technician names, and plant locations are redacted at the local gateway level via a Trusted Execution Environment (TEE) simulation before invoking external cloud API endpoints.
*   **Merkle-Chain Change Integrity**: Every operational topology change or audit log is cryptographically chained, creating an immutable history of plant updates.

---

## 2. High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            INGESTION LAYER (OT-IT Inputs)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│  │ Failure logs │  │ SOPs/Manuals │  │ Audio/Voice   │  │ Sensor/Alarm CS │  │
│  │ (Web Form)   │  │ (PDF/DOCX)   │  │ Notes (WAV)   │  │ logs (Vibration)│  │
│  └───────┬──────┘  └──────┬───────┘  └───────┬───────┘  └────────┬────────┘  │
│          └────────────────┼──────────────────┘                   │           │
│                           ▼                                      ▼           │
│                 ┌───────────────────┐                  ┌──────────────────┐  │
│                 │ Schema Validator  │                  │ Asset UAT        │  │
│                 │ (Fields Check)    │                  │ Normalizer       │  │
│                 └─────────┬─────────┘                  └────────┬─────────┘  │
└───────────────────────────┼─────────────────────────────────────┼────────────┘
                            │                                     │
┌───────────────────────────▼─────────────────────────────────────▼────────────┐
│                    PROCESSING & EXTRACTION LAYER (AI Pipeline)              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                     MULTI-FORMAT INGESTION ENGINE                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐   │  │
│  │  │   PyPDF2    │  │ Tesseract   │  │ Whisper STT │  │  Text Decode │   │  │
│  │  │ (PDF Ingest)│  │ (Image OCR) │  │  (Audio)    │  │ (CSV/TXT/Doc)│   │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘   │  │
│  │         └────────────────┴──────┬───────┴───────────────┘          │  │
│  │                                 ▼                                  │  │
│  │                      ┌─────────────────────┐                       │  │
│  │                      │ 512-Token Chunker   │                       │  │
│  │                      └──────────┬──────────┘                       │  │
│  │                                 ▼                                  │  │
│  │                      ┌─────────────────────┐                       │  │
│  │                      │ BGE-Large Embedding │                       │  │
│  │                      │ (1024D dense vector)│                       │  │
│  │                      └──────────┬──────────┘                       │  │
│  │                                 ▼                                  │  │
│  │                      ┌─────────────────────┐                       │  │
│  │                      │   2-Tier Hybrid NER │                       │  │
│  │                      │  (Groq LLM/Regex)   │                       │  │
│  │                      └─────────────────────┘                       │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┬─────────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       KNOWLEDGE & DATA PERSISTENCE LAYER                    │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │  PostgreSQL   │  │   pgvector    │  │  indra-assets │  │   Knowledge   │  │
│  │  (OLTP Core)  │  │  (Vector DB)  │  │ (Object Store)│  │     Graph     │  │
│  │               │  │               │  │               │  │ (Unified Link)│  │
│  │ • Failure Eves│  │ • Chunk Texts │  │ • Raw PDFs    │  │               │  │
│  │ • Work Orders │  │ • Dense Vecs  │  │ • WAV Audio   │  │  Asset UAT    │  │
│  │ • Alarms      │  │   (1024D)     │  │ • CSV logs    │  │       ▲       │  │
│  │ • Documents   │  │ • Index HNSW  │  │ • Wisdom TXT  │  │  Work Order   │  │
│  │ • Entities    │  │               │  │               │  │       ▲       │  │
│  │ • Audit logs  │  │               │  │               │  │  Failure Case │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  └───────────────┘  │
└────────────────────────────────────┬─────────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AGENTIC ORCHESTRATION & SECURITY LAYER                   │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                 TRUSTED EXECUTION ENVIRONMENT (TEE) SHIELD             │  │
│  │  • Redacts sensitive IP, names, and plant areas before cloud LLM API   │  │
│  │  • AMD SEV-SNP cryptographic enclave protection & logs verification    │  │
│  │  • Re-injects plant entities during post-processing response stage   │  │
│  │  └──────────────────────────────────┬─────────────────────────────────┘  │
│  │                                     ▼                                  │  │
│  │                 MULTI-AGENT SUPERVISOR (LANGGRAPH ROUTER)              │  │
│  │   ┌───────────────┐  ┌───────────────┐  ┌──────────────┐  ┌────────────┐   │  │
│  │   │  Query Agent  │  │   RCA Agent   │  │ Predictive A.│  │Expert Shield│   │  │
│  │   │ (Semantic RAG)│  │ (Failure RCA) │  │(Pattern Alert│  │(Tribal Wise│   │  │
│  │   └───────────────┘  └───────────────┘  └──────────────┘  └────────────┘   │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Deep Dive & Data Pipeline Specifications

### A. Ingestion Pipeline
The ingestion portal accepts multiple industrial data flows. Data flows into two pipelines:
1.  **Direct SQL Entry**: Structured incident logs and forms go directly into PostgreSQL (`failure_events`, `work_orders`).
2.  **File Storage Entry**: SOPs, manuals, sensor CSVs, and audio logs are uploaded to the `indra-assets` bucket in Supabase Object Storage.
    *   **Validation**: Every file upload must contain metadata containing the target **Asset UAT code** (e.g. `REF-HTX-R101-001`) to map it to the physical asset hierarchy.

### B. Processing & Extraction Pipeline
Once registered, the document triggers the processing pipeline:
1.  **Extraction Engine**:
    *   **PyPDF2** extracts native text blocks from engineering PDFs.
    *   **Tesseract OCR** parses scanned images and mechanical blueprints.
    *   **Whisper STT** transcribes WAV/MP3 field engineer walk-down voice notes.
2.  **Text Chunking**: Segments extracted text into 512-character blocks with a 64-character overlap to preserve local context.
3.  **Embedding Generation**: Chunks are batched and fed into the local **BGE-Large-EN-v1.5** model to generate 1024-dimensional floating-point dense vectors. These are saved to `document_embeddings`.
4.  **Named Entity Recognition (NER)**:
    *   **Tier 1 (LLM)**: Passes chunks to Groq API (Llama-3.3-70b) to extract complex context (e.g. specialized tag ranges, technician names).
    *   **Tier 2 (Fallback RegEx)**: If Groq rate limits (HTTP 429) or payloads are too large, custom regex patterns scan for tags (regex: `\b[A-Z]{1,3}-\d{2,4}[A-Z]?\b`), temperatures, pressures, and dates. All entities save to `extracted_entities`.

### C. Knowledge & Persistence Layer
*   **Supabase PostgreSQL (OLTP)**: Houses the normalized schema tracking relations:
    *   `assets` are mapped by UAT.
    *   `documents` act as references.
    *   `extracted_entities` anchor raw text to tags.
    *   `engineering_change_record` stores Merkle-hashed records.
*   **pgvector**: Stores high-dimensional BGE embeddings. HNSW indices are calculated for sub-second vector cosine-distance matches:
    $$\text{Cosine Similarity} = 1 - (\text{embedding} \Leftrightarrow \text{query\_embedding})$$

### E. Security & Agentic Orchestration Layer
1.  **TEE Shield (AMD SEV-SNP)**:
    *   Intercepts natural language queries inside the TEE enclave.
    *   Redacts sensitive tags and tech names (e.g. `E-201` -> `[EQUIPMENT_TAG_1]`).
    *   Calls the LLM API using the masked text.
    *   Decrypts and re-injects real tags into the final output returned to the UI.
2.  **Multi-Agent Orchestrator**:
    *   **Supervisor Agent**: Receives and triages user requests.
    *   **Query Agent (RAG)**: Conducts vector search over plant documentation and expert tips.
    *   **RCA Agent**: Analyzes failure history, active alarms, and work orders to generate formal Root Cause Analysis reports.
    *   **Predictive Agent**: Scans sensor CSV logs to forecast failures.
    *   **Expert Shield**: Focuses specifically on looking up tribal wisdom notes submitted by retiring experts to supplement standard search.

---

## 4. Implementation Matrix

| Tech Stack Component | Software Selection | Purpose | Port / Deployment |
| :--- | :--- | :--- | :--- |
| **Backend Framework** | FastAPI (Python 3.10) | REST API Gateway / Agent Router | Port 8000 |
| **Frontend UI** | HTML5 / CSS3 / Vanilla JS | Responsive Control Dashboard | Port 8080 |
| **Database Engine** | PostgreSQL + pgvector | Asset metadata & vector storage | Supabase Cloud |
| **Object Storage** | Supabase Storage | Document & Audio Binary Storage | `indra-assets` bucket |
| **Embedding Model** | BGE-Large-EN-v1.5 | Local 1024D vector extraction | Local directory (`model_bge_large`) |
| **Primary LLM** | Llama-3.3-70b-versatile | RAG Synthesis, RCA, and Entity extraction | Groq API Gateway |
| **Enclave Enforcer** | AMD SEV-SNP Simulator | TEE Shield prompt anonymization | Local python wrapper |
| **Cryptographic Signer** | ReportLab + hashlib | Immutable PDF exports (SHA-256) | Backend module |
