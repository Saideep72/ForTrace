# ForTrace — Industrial Knowledge Intelligence Platform

**Built by Team Arise**

ForTrace is a production-grade, offline-friendly industrial intelligence platform designed for plant managers, maintenance engineers, safety officers, field technicians, and domain experts. It parses unstructured engineering manuals, maps plant topology dependencies, monitors alarm histories, structures audit-compliant engineering change records, tracks peer-reviewed expert tribal wisdom, simulates cascade trip scenarios, and processes bilingual voice queries with dynamic spoken summaries.

---

## 🏗️ Repository Layout

The repository is structured into backend and frontend components:

```bash
ForTrace/
├── backend/                  # FastAPI web server & microservices
│   ├── app/
│   │   ├── agents_engine/    # LangGraph Agent Orchestrator
│   │   │   ├── agents/       # Supervisor, RCA, Query, Predictive & Network modules
│   │   │   ├── core/         # LLM configuration & confidence scoring engine
│   │   │   ├── graph/        # LangGraph State & compilation builders
│   │   │   └── tools/        # Live database connectors for agent logic
│   │   ├── api/              # API routers (auth, query, graph, reports, simulation, expert, documents)
│   │   ├── core/             # Security, Database connection pools, Configs
│   │   ├── models/           # Pydantic schemas & database schemas
│   │   └── services/         # Extraction, translation, and vector search services
│   ├── requirements.txt      # Python package dependencies
│   └── test_agent_network.py # Verification script for multi-agent execution
│
├── frontend/                 # Plant Operations Web Interface
│   ├── index.html            # Core HTML structure, modals, and dynamic views
│   └── index.css             # Vibrant, responsive CSS theme (vanilla style)
│
├── Seed_Data_records.md      # Seed datasets for assets, alarms, and work orders
├── upload_testcases_11to30.py# Bulk document data migration runner
└── README.md                 # Project documentation
```

---

## ⚡ Core Features

### 1. Unified Multi-Agent AI (LangGraph)
* Uses a compiled graph network orchestrated by a **Supervisor Agent** to route user queries dynamically to specialized sub-agents:
  * **QueryAgent**: Standard Operations & SOP Search (Groq Llama 3.3 + Supabase Vector RAG).
  * **RCAAgent**: Root Cause Failure Diagnostics & Incident History Analysis.
  * **NetworkAgent**: Live Asset Topology, Upstream/Downstream Dependency Tracing.
  * **PredictiveAgent**: Predictive Maintenance Alerts & Sensor Drift Monitoring.
* Connects directly to live PostgreSQL tables (`assets`, `alarm_history`, `work_orders`, `documents`, `expert_wisdom`).

### 2. Relational Topology Graph (Vis.js Network)
* Renders an interactive plant layout canvas of physical assets, engineering manuals, failure incidents, alarms, and work orders.
* **Causal Path Tracing**: Clicking a node highlights immediate upstream and downstream dependencies while dimming unrelated plant nodes.
* Includes search depth selector (1 to 3 hops), node tags toggle, live legend filters, and fit-view controls.

### 3. What-If Cascade Stress Tester (Digital Twin Simulator)
* Real-time blast-radius simulation engine (`/api/v1/simulation/simulate`).
* Allows plant engineers to trigger simulated trips (e.g., `fouling_shutdown`, `thermal_runaway`, `vibration_trip`, `power_failure`) on target equipment.
* Computes multi-tier downstream impact chains, total affected units, and **hourly financial loss estimates** based on asset criticality ratings.

### 4. Expert Advice & Tribal Wisdom Dossiers
* Dedicated **Expert Advice** dashboard for certified domain experts and senior engineers.
* Enables submission of peer-reviewed failure root-cause verdicts, maintenance checklists, and operational tribal wisdom notes mapped directly to physical asset UATs.
* Includes an **Admin / Plant Manager Provisioning Modal** (`openProvisionExpertModal()`) to create and manage certified expert accounts.

### 5. Multi-Modal Document Knowledge Base (RAG)
* Supports ingestion of PDFs, Word (`.docx`), DCS Alarm JSON configs, Images (`.jpg`/`.png`), and Audio (`.mp3`) acoustic leak logs.
* Auto-extracts content, embeds text via PgVector, and maps documents directly to plant asset UAT identifiers.
* Sorted **newest-first** with pagination and file-type filtering (`REGULATORY_FILING`, `LESSONS_LEARNED`, `SOP`, etc.).

### 6. Bilingual Voice Command Pipeline
* Supports voice queries in **English** and **Hindi / Hinglish**.
* **STT**: Uses Groq Whisper Large for WAV/WebM audio transcription.
* **Translation**: Automatically translates Hindi prompts into English for agent processing, then returns bilingual explanations.
* **TTS**: Browser Web Speech API delivers dynamic 1-2 sentence spoken summaries out loud.

### 7. Audit Ledger & Report Generation
* **Merkle-Verified Change Ledger**: Tracks Engineering Change Records (ECRs) with cryptographic hashes.
* **ReportLab RCA Generator**: Compiles downloadable PDF root-cause analysis packages for incident reviews.

---

## 🛡️ Role-Based Access Control (RBAC)

The UI automatically customizes navigation tabs, action buttons, and feature panels based on the user's authenticated JWT role:

| Role | Authorized Tabs / Dashboards | System Capabilities |
|---|---|---|
| **Plant Manager** | Home, Docs, AI Chat, Network, Reports & Audit, Expert Advice | Full administrative access, ECR approvals, Expert provisioning |
| **Maintenance Engineer** | Home, Docs Dashboard, AI Chat, Network Analysis | Asset management, SOP uploads, Work order tracking |
| **Expert / SME** | Home, AI Agent Chat, Network Analysis, Expert Advice | Submit expert wisdom dossiers, review failure cases, add verdicts |
| **Field Technician** | Home, AI Agent Chat, Network Analysis | Read-only topology view, voice queries, SOP search |
| **Auditor** | Home, Network Analysis, Reports & Audit | View compliance records, change ledgers, and audit logs |
| **System Admin** | All Dashboards + System Console | Full administrative controls, user management, system metrics |

---

## 🚀 How to Set Up & Run

### 1. Prerequisites
* Python 3.10+
* Modern Web Browser (Chrome, Edge, Firefox)

### 2. Backend Setup
1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Linux/macOS:
   source venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in `backend/` with your environment keys:
   ```ini
   SUPABASE_URL=https://<your-project>.supabase.co
   SUPABASE_SERVICE_KEY=<service-role-key>
   SUPABASE_ANON_KEY=<anon-key>
   GROQ_API_KEY=<groq-key>
   SECRET_KEY=<jwt-secret-key>
   ```
5. Start the FastAPI server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *Swagger Docs: `http://127.0.0.1:8000/docs`*

### 3. Frontend Setup
Start a lightweight HTTP server in `frontend`:
```bash
cd frontend
python -m http.server 8080
```
Open `http://127.0.0.1:8080/` in your browser.

### 4. Production Deployment
For detailed production deployment instructions (deploying backend on Railway and frontend on Vercel), see [DEPLOYMENT.md](file:///d:/Projects/FortTrace/FortTrace/DEPLOYMENT.md).

---

## 🧪 Verification & Testing
* Run `python test_agent_network.py` in `backend/` to verify multi-agent routing and database connectors.
* Test the **What-If Simulator** on the Network Analysis tab by selecting an asset (e.g. `REF-HTX-E201-001`) and simulating a trip scenario.
* Log in as an **Expert** user to submit tribal wisdom dossiers under the Expert Advice dashboard.
