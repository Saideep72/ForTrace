# ForTrace — Industrial Knowledge Intelligence Platform

**Built by Team Arise**

ForTrace is a production-grade, offline-friendly industrial intelligence platform designed for plant managers, maintenance engineers, safety officers, and field technicians. It parses unstructured engineering manuals, maps plant topology dependencies, monitors alarm histories, structures audit-compliant engineering change records, and processes bi-lingual voice queries with dynamic spoken summaries.

---

## 🏗️ Repository Layout

The repository is structured into two main components:

```bash
ForTrace/
├── backend/                  # FastAPI web server & services
│   ├── app/
│   │   ├── agents_engine/    # LangGraph Agent Orchestrator (Anushka's engine)
│   │   │   ├── agents/       # Supervisor, RCA, Query, Predictive modules
│   │   │   ├── core/         # LLM configuration & confidence scoring
│   │   │   ├── graph/        # LangGraph State & compilation builders
│   │   │   └── tools/        # Live database connectors for agent logic
│   │   ├── api/              # API routers and endpoints (auth, query, graph, reports)
│   │   ├── core/             # Security, Database connection pools, Configs
│   │   ├── models/           # Pydantic schemas & database models
│   │   └── services/         # Extraction, translation, and vector search services
│   ├── requirements.txt      # Python package dependencies
│   └── test_agent_network.py # Verification script for multi-agent execution
│
├── frontend/                 # Plant Operations Web Interface
│   ├── index.html            # Core HTML, layout, forms, and canvas modules
│   └── index.css             # Vibrant, responsive CSS theme (vanilla style)
│
├── .gitignore                # Root-level ignore rules (ignores virtual envs, local models, .env)
├── Seed_Data_records.md      # Seed datasets for assets, alarms, and work orders
└── README.md                 # Project documentation
```

---

## ⚡ Core Features

### 1. Unified Multi-Agent AI (LangGraph)
* Uses a compiled graph network orchestrated by a **Supervisor Agent** to route requests dynamically.
* Connects the agent network to live PostgreSQL tables (`assets`, `alarm_history`, `work_orders`, `documents`) using custom database query tools, enabling context-aware plant diagnostics.

### 2. Relational Topology Graph (Vis.js)
* Renders an interactive canvas of the plant layout including assets, manuals, failure incidents, alarms, and maintenance work orders.
* Custom styling separates equipment type and document severity.
* **Causal Path Tracing**: Clicking a node highlights its immediate dependencies (upstream and downstream) and dims the rest of the canvas.
* Includes a built-in search depth filter, node tags toggle, and a **🔍 Fit View** button.

### 3. Bi-lingual Voice Command Pipeline
* Supports voice command queries in both **English** and **Hindi/Hinglish**.
* **STT (Speech-to-Text)**: Backend uses Groq Whisper Large for WAV audio transcription.
* **Translation**: Uses Groq Llama 3.3 to auto-translate Hindi queries into English, feeds them to the agent, and optionally translates responses back to Devanagari Hindi.
* **Conversational Memory**: Remembers thread history, allowing technicians to ask follow-up questions during inspections.
* **TTS (Text-to-Speech)**: Automatically speaks a 1-2 sentence spoken summary out loud using the native browser Web Speech API.

### 4. Merkle-Verified Change Ledger & Reports
* Features an **Engineering Change Record (ECR)** ledger where updates are tracked.
* Log audits store every AI agent request, confidence score, and query latency.
* **RCA PDF Compilation**: Generates ReportLab-backed PDF root-cause packages for failures, supporting smart index-to-UUID resolving (e.g. searching index `1` maps to the actual database UUID).

---

## 🚀 How to Set Up & Run

### 1. Prerequisites
* Python 3.10+
* modern web browser (Chrome, Edge, Firefox)

### 2. Backend Installation & Start
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file inside the `backend` folder containing the following environment variables:
   ```ini
   SUPABASE_URL=https://<your-project>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   SUPABASE_ANON_KEY=<anon-key>
   GROQ_API_KEY=<groq-key>
   ```
5. Launch the FastAPI server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   Verify that Swagger UI is accessible at `http://127.0.0.1:8000/docs`.

### 3. Frontend Start
Simply open the `frontend/index.html` file directly in any modern web browser:
```bash
# Double-click frontend/index.html or run:
start frontend/index.html
```

---

## 🛡️ Role-Based Access Control (RBAC)

The interface adapts dynamically depending on the user's logged-in role (extracted and decoded directly from the JWT access token):

| Role | Authorized Tabs / Pages | Extra Capabilities / Restrictions |
|---|---|---|
| **Plant Manager** | Home, Docs Dashboard, AI Chat, Network, Reports & Audit | Full access (create, update, delete, ECR approvals) |
| **Field Technician** | Home, AI Agent Chat, Network Analysis | Read-only view (Cannot upload/delete files or view system console) |
| **Auditor** | Home, Network Analysis, Reports & Audit | View compliance records and change trails (No upload/chat access) |
| **Maintenance Engineer** | Home, Docs Dashboard, AI Agent Chat, Network | Manage assets and upload SOP manuals (No reports panel access) |
| **System Admin** | Home, Docs Dashboard, AI Chat, Network, Reports, System Console | Config logs, full token visualization, user management |

---

## 🧪 Verification & Testing
* Run `python test_agent_network.py` in the `backend` folder to verify that Anushka's agent network compiles, registers tools, and correctly queries the plant database.
* To test the user role filters:
  * Register a new user on the authentication page with the **Field Technician** role.
  * Sign in using those credentials.
  * Verify that the navbar automatically hides the **Documents Dashboard** and **System Console** tabs.
