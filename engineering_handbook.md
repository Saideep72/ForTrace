# 🏭 ForTrace – Ultimate Engineering & Integration Handbook

This handbook is a comprehensive, production-grade guide for both backend and frontend development teams working on the **ForTrace – Plant Operations Intelligence platform**. It contains exact schemas, API payloads, functional logic, and step-by-step frontend wiring instructions to solve common integration issues (such as `Failed to fetch` errors on network graphs).

---

## 1. System Architecture Overview

ForTrace uses a **Multi-Agent Orchestrator Model** powered by **LangGraph** on the backend, integrated with FastAPI, Supabase PostgreSQL, and Groq inference servers.

### 🧭 LangGraph Agent Topology
User queries are routed through a central graph workflow that distributes tasks based on detected query intents:

```
                            [START]
                               │
                       [Supervisor Router]
                               │
      ┌──────────────┬─────────┼──────────────┬──────────────┐
      ▼              ▼         ▼              ▼              ▼
 [QueryAgent]   [RCAAgent]  [Predictive]  [Network]   [OutOfScope]
  (RAG/Expert)   (Failures)  (Maintenance) (Topology)  (Fast Filter)
      │              │         │              │              │
      └──────────────┴─────────┼──────────────┴──────────────┘
                               ▼
                             [END]
```

### 🔁 Chained Multi-Model Fallback
To ensure continuous operability and shield the platform from API rate limits (HTTP 429), the LLM wrapper implements a chained backup system. If the primary model fails or runs out of tokens, LangChain's `.with_fallbacks()` mechanism seamlessly routes the execution to the next fallback:

1. **Primary Model:** `qwen/qwen3-32b` (Optimized for reasoning and prompts processing)
2. **Fallback 1:** `llama-3.3-70b-versatile` (Robust large-scale backup)
3. **Fallback 2:** `mixtral-8x7b-32768` (High-speed context processing)
4. **Fallback 3:** `llama-3-8b-8192` (Lightweight offline-safe fallback)

This applies to standard queries and structured schema outputs alike.

---

## 2. Database Schemas (Supabase PostgreSQL)

Ensure these schemas and tables are configured in the Supabase PostgreSQL database. Pay close attention to constraints on `user_role` and `doc_type`:

### A. Core Tables

#### `assets`
Stores industrial equipment metadata:
```sql
CREATE TABLE assets (
    uat VARCHAR(100) PRIMARY KEY, -- Unique Asset Tag (e.g., "REF-HTX-E201-001")
    plant_code VARCHAR(50) NOT NULL,
    area_code VARCHAR(50) NOT NULL,
    system_code VARCHAR(50) NOT NULL,
    equipment_tag VARCHAR(100) NOT NULL,
    equipment_type VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(150),
    model_number VARCHAR(150),
    install_date DATE,
    criticality_rating VARCHAR(20) DEFAULT 'Medium', -- Low, Medium, High, Critical
    status VARCHAR(50) DEFAULT 'active', -- active, maintenance, standby
    location_description TEXT,
    gps_lat DOUBLE PRECISION,
    gps_long DOUBLE PRECISION,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

#### `users`
Defines accounts and access tiers:
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- Admin, Plant_Manager, Expert_Engineer, Maintenance_Engineer, Field_Technician, Auditor
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```
> [!IMPORTANT]
> **Registration Rule:** The roles `"Admin"` and `"Expert_Engineer"` are restricted and cannot be created via the self-registration endpoint. They must be manually pre-seeded or updated by an administrator in the database.

#### `documents`
Stores reference manuals, blueprints, and retiring engineer expert tips:
```sql
CREATE TABLE documents (
    doc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uat VARCHAR(100) REFERENCES assets(uat) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    doc_type VARCHAR(50) NOT NULL, -- SOP, OEM_MANUAL, PID, P&ID, WORK_ORDER, INSPECTION_REPORT, REGULATORY_FILING, INCIDENT_REPORT, LESSONS_LEARNED
    file_path TEXT NOT NULL,
    file_hash VARCHAR(64) UNIQUE NOT NULL, -- Deduplication SHA-256
    revision VARCHAR(50) DEFAULT '1.0',
    compliance_scope VARCHAR(255)[],
    is_active BOOLEAN DEFAULT TRUE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    uploaded_by UUID REFERENCES users(user_id)
);
```
> [!IMPORTANT]
> **Ingestion Access Control:** Documents of type `"LESSONS_LEARNED"` (Expert Engineer handover notes/tips) can only be uploaded by users with roles `Expert_Engineer`, `Plant_Manager`, or `Admin`. Any upload attempt by other roles (e.g., standard Field Technician) will return an HTTP 403 Forbidden error.

#### `document_chunks`
Stores text segments and embeddings for pgvector RAG:
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_chunks (
    chunk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_id UUID REFERENCES documents(doc_id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1024), -- Local BGE-Large (1024 dimensions)
    chunk_metadata JSONB DEFAULT '{}'::jsonb
);
```

#### `failure_events`
Logs breakdowns for Root Cause Analysis:
```sql
CREATE TABLE failure_events (
    failure_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uat VARCHAR(100) REFERENCES assets(uat) ON DELETE CASCADE,
    failure_mode VARCHAR(200) NOT NULL,
    failure_category VARCHAR(100),
    severity VARCHAR(50) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    occurrence_date TIMESTAMP WITH TIME ZONE NOT NULL,
    root_cause TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

#### `alarm_history`
Maintains real-time and historical SCADA alarm records:
```sql
CREATE TABLE alarm_history (
    alarm_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uat VARCHAR(100) REFERENCES assets(uat) ON DELETE CASCADE,
    tag_name VARCHAR(100) NOT NULL,
    alarm_type VARCHAR(100) NOT NULL,
    alarm_priority VARCHAR(50) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    triggered_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);
```

#### `engineering_change_record`
Immune change ledger (Commit hash linked to parents to form a Merkle sequence):
```sql
CREATE TABLE engineering_change_record (
    change_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commit_hash VARCHAR(64) UNIQUE NOT NULL,
    parent_hash VARCHAR(64),
    uat VARCHAR(100) REFERENCES assets(uat),
    action VARCHAR(50) NOT NULL, -- CREATE, VERIFY, SUPERSEDE
    details TEXT,
    change_engineer VARCHAR(255) NOT NULL,
    approved_by VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

#### `agent_query_audit_log`
Security audit logs tracking query metrics:
```sql
CREATE TABLE agent_query_audit_log (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    user_role VARCHAR(100) NOT NULL,
    query_text TEXT NOT NULL,
    agent_used VARCHAR(100) NOT NULL,
    confidence_score DOUBLE PRECISION,
    latency_ms INT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

---

## 3. Core Backend Functional Logic

### 📄 Ingestion & Text Extraction Pipeline
When a document is uploaded, it undergoes text extraction:
1. **PDF Files:** Extracted using standard page parsing text blocks.
2. **Word Documents (DOCX):** Parsed by reading the raw XML `word/document.xml` structure to extract text nodes efficiently.
3. **ZIP Files:** Extracted recursively to process all matching child files.
4. **Audio Files (WAV/MP3):** Transcribed using Groq's Whisper API.
5. **Images (PNG/JPG):** Runs locally through **Tesseract OCR** engine.
6. **Named Entity Recognition (NER):** Runs text segments through ChatGroq to extract metadata and falls back to a regex parser if offline.
7. **Embeddings:** Generates 1024-dimension vectors locally and writes chunks to `document_chunks` using pgvector.

### 🛡️ TEE Anonymization Shield
When TEE Shield mode is active:
1. The user's query is intercepted inside a simulated Confidential Enclave (`tee_simulator.py`).
2. Hardware indicators (e.g., specific asset tags `02-SIS-04` or plant areas) are masked with generic tokens (e.g., `[ASSET_0]`).
3. The masked query is sent to the LLM.
4. The response returned is de-anonymized inside the enclave (substituting `[ASSET_0]` back to `02-SIS-04`) before it is sent to the client.
5. High-trust attestation reports from the AMD SEV-SNP simulation are appended to the response metadata.

---

## 4. API Documentation (FastAPI)

All endpoints are prefixed with `/api/v1`.

### 1. User Authentication
* **Endpoint:** `POST /api/v1/auth/login`
* **Format:** Form-urlencoded Data (x-www-form-urlencoded)
* **Request Fields:**
  * `username` (string - Email ID)
  * `password` (string - Password)
* **Response Payload (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user_role": "Plant_Manager",
    "user_email": "manager@plant.com"
  }
  ```

* **Endpoint:** `POST /api/v1/auth/register`
* **Format:** JSON
* **Request Payload:**
  ```json
  {
    "email": "engineer@plant.com",
    "password": "SecurePassword@123",
    "full_name": "R. Iyer",
    "role": "Maintenance_Engineer"
  }
  ```
  *(Note: Roles "Expert_Engineer" and "Admin" will return a `403 Forbidden` error if requested here).*

---

### 2. Asset Network Topology Graph
* **Endpoint:** `GET /api/v1/graph/topology`
* **Headers:** `Authorization: Bearer <access_token>`
* **Response Payload (200 OK):**
  ```json
  {
    "nodes": [
      {
        "id": "REF-HTX-E201-001",
        "label": "Cooling Exchanger E-201",
        "group": "assets",
        "properties": {
          "type": "heat_exchanger",
          "status": "active",
          "criticality": "High",
          "manufacturer": "Alfa Laval"
        }
      },
      {
        "id": "ALM-301",
        "label": "T-301 Temperature Spike",
        "group": "alarms",
        "properties": {
          "uat": "REF-HTX-E201-001",
          "alarm_type": "High Temperature",
          "alarm_priority": "CRITICAL",
          "triggered_at": "2026-07-18T10:00:00Z"
        }
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "from": "REF-HTX-E201-001",
        "to": "ALM-301",
        "label": "HAS_ALARM"
      }
    ]
  }
  ```

---

### 3. Document Ingestion
* **Endpoint:** `POST /api/v1/documents/upload`
* **Format:** Multipart Form Data (multipart/form-data)
* **Headers:** `Authorization: Bearer <access_token>`
* **Request Parameters:**
  * `file` (Binary File - PDF, DOCX, ZIP, MP3, PNG etc.)
  * `uat` (string - e.g., "REF-HTX-E201-001")
  * `title` (string - Title of document)
  * `doc_type` (string - Literal value: `SOP`, `OEM_MANUAL`, `P&ID`, `LESSONS_LEARNED` etc.)
  * `revision` (string - e.g., "1.0")
  * `compliance_scope` (string - e.g., "Safety, Environmental")
* **Response Payload (201 Created):**
  ```json
  {
    "doc_id": "511eafc4-9148...",
    "uat": "REF-HTX-E201-001",
    "title": "Retiring Expert Handover Tips",
    "doc_type": "LESSONS_LEARNED",
    "file_path": "lessons_learneds/REF-HTX-E201-001/notes.txt",
    "is_active": true
  }
  ```

---

### 4. AI Agent Dispatcher Query
* **Endpoint:** `POST /api/v1/query/ask`
* **Headers:** `Authorization: Bearer <access_token>`
* **Request Payload:**
  ```json
  {
    "query": "What guidelines did lead engineer R. Iyer leave for cooling pump loops?",
    "query_language": "en",
    "session_id": "session-12345",
    "tee_shield": true,
    "include_expert_advice": true
  }
  ```
* **Response Payload (200 OK):**
  ```json
  {
    "answer": "The engineer advised to check bypass valve 12-VLV-102 before startup...\n\n**Expert Advice (Retiring Engineer Notes):**\n- Verify bypass valve alignment.",
    "agent_used": "QueryAgent",
    "confidence": 0.95,
    "tee_metadata": {
      "enclave_id": "enclave-sim-snp",
      "measurement": "a9a3b8e2...",
      "signature": "12fefc8c...",
      "anonymization_logs": [
        "Replacing '02-SIS-04' -> '[ASSET_0]'"
      ],
      "deanonymization_logs": [
        "Restoring '[ASSET_0]' -> '02-SIS-04'"
      ]
    }
  }
  ```

---

### 5. Root Cause Analysis Report (PDF Generator)
* **Endpoint:** `POST /api/v1/reports/rca`
* **Headers:** `Authorization: Bearer <access_token>`
* **Request Payload:**
  ```json
  {
    "failure_id": "UUID-string"
  }
  ```
* **Response:** Streaming Binary PDF file (`application/pdf`).

---

### 6. Engineering Change Records (ECR Ledger)
* **Endpoint:** `GET /api/v1/reports/engineering-changes`
* **Headers:** `Authorization: Bearer <access_token>`
* **Response Payload (200 OK):**
  ```json
  [
    {
      "change_id": "UUID",
      "commit_hash": "2f40b2a7...",
      "parent_hash": "00000000...",
      "uat": "REF-HTX-E201-001",
      "action": "CREATE",
      "change_engineer": "engineer@plant.com",
      "approved_by": "manager@plant.com",
      "timestamp": "2026-07-18T10:00:00Z"
    }
  ]
  ```

---

## 5. Frontend Integration Guide (Troubleshooting & Tips)

If the frontend team reports that pages are failing to fetch or show errors, please check the following:

### ⚠️ Resolving `Failed to fetch` on Topology / Asset Graphs
The `/graph/topology` endpoint is protected by Role-Based Access Control (RBAC). It expects a valid JSON Web Token (JWT) in the `Authorization` header. If the header is missing, the request fails with a `401 Unauthorized` or CORS error.

**Correct JavaScript Fetch Wrapper Pattern:**
Ensure all API requests implement this authentication logic:

```javascript
// api.js
const BASE_URL = 'http://127.0.0.1:8000/api/v1';

async function fetchWithAuth(endpoint, options = {}) {
  // 1. Retrieve the stored access token from localStorage
  const token = localStorage.getItem('access_token');
  
  // 2. Build request headers
  const headers = {
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 3. For standard JSON requests, set content-type (exclude for FormData uploads)
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 4. Handle expired session redirection
  if (response.status === 401) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    window.location.href = '/login.html?session_expired=true';
    throw new Error('Unauthorized session expired');
  }

  return response;
}
```

**Wiring up the vis.js Graph Node Click Event:**
```javascript
// When fetching topology data
fetchWithAuth('/graph/topology')
  .then(data => {
    // Map data.nodes to vis.js Network
    // Map data.edges to vis.js Network
    renderTopologyGraph(data.nodes, data.edges);
  })
  .catch(err => {
    console.error('Failed to load topology graph:', err);
    showErrorBanner('Failed to load asset network. Verify auth headers.');
  });
```

---

### 🧑‍💻 How to Integration-Test the Expert Advice Toggle
In the chat interface, add a Boolean checkbox input labelled **"Include Retiring Engineer Expert Advice"**. 

1. Map this checkbox state to a variable: `includeExpertAdvice` (boolean).
2. When calling `/query/ask`, pass the state directly:
   ```javascript
   const payload = {
     query: userQueryText,
     query_language: selectedLanguage, // 'en' or 'hi'
     session_id: 'chat-session-react',
     tee_shield: teeShieldActive, // boolean
     include_expert_advice: includeExpertAdvice // boolean
   };
   ```
3. **Testing Behavior:**
   - Upload a test file under `doc_type = "LESSONS_LEARNED"` linked to asset `REF-HTX-E201-001`.
   - Ask: *"What guidelines were left for REF-HTX-E201-001?"*
   - With `include_expert_advice = false`, the response should say no guidelines are available or reference standard SOP manual chunks.
   - With `include_expert_advice = true`, the response will retrieve the expert chunk and format it under `Expert Advice (Retiring Engineer Notes)`.

---

### 🛡️ Client-Side RBAC Tab Hiding
To prevent unauthorized users from viewing admin pages (e.g., Settings, Document Library uploads), read the user's role from localStorage and conditionally hide UI sections:

```javascript
function applyRBACControls() {
  const role = localStorage.getItem('user_role');
  
  if (!role) {
    window.location.href = '/login.html';
    return;
  }

  // Define hidden elements per role
  const hiddenElements = {
    'Field_Technician': ['.admin-settings-tab', '.upload-documents-section', '.change-ledger-tab'],
    'Auditor': ['.upload-documents-section', '.ai-agent-chat-tab'],
    'Maintenance_Engineer': ['.admin-settings-tab']
  };

  const selectors = hiddenElements[role] || [];
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  });
}

// Call on DOMContentLoaded
document.addEventListener('DOMContentLoaded', applyRBACControls);
```
