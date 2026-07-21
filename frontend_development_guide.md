# Frontend Development Guide for **ForTrace – Plant Operations Intelligence**

> This document is meant for the UI/UX engineer or frontend developer who will build a **premium‑looking, responsive** web application. It contains:
> * All public API endpoints (FastAPI)
> * Expected request/response payloads
> * Authentication flow (JWT)
> * UI component library & design tokens (colors, typography, layout)
> * RBAC‑aware UI patterns
> * Code snippets (Fetch API) and wiring examples

---

## 1. Project Overview
- **Backend**: FastAPI (`c:/AIML/ForTrace/backend/app/api/v1/endpoints/…`).
- **Frontend**: Pure HTML/JS/CSS (no framework required) – you can optionally start a lightweight Vite dev server if you prefer.
- **Auth**: Supabase JWT stored in `localStorage` under key `access_token`.
- **RBAC roles**: `Plant_Manager`, `Maintenance_Engineer`, `Admin`, `Field_Technician`, `Auditor`.
- **Base URL** (when run locally): `http://127.0.0.1:8000/api/v1/`

---

## 2. Design System (Premium Look & Feel)
| Token | Value | Usage |
|-------|-------|-------|
| **Primary Color** | `hsl(210, 55%, 55%)` (deep blue) | Nav‑bar, buttons, active tabs |
| **Accent Color** | `hsl(34, 85%, 55%)` (vibrant orange) | Call‑to‑action, hover states |
| **Background** | `hsl(0, 0%, 97%)` (off‑white) | Page background |
| **Surface** | `hsl(0, 0%, 100%)` with `box‑shadow: 0 4px 12px rgba(0,0,0,0.06)` | Cards, panels |
| **Typography** | Google Font **"Inter"** – 400/600/700 weights | Headings, body, UI controls |
| **Radius** | `8px` (rounded corners) | Buttons, cards, inputs |
| **Glass‑morphism overlay** | `background: rgba(255,255,255,0.75); backdrop-filter: blur(8px);` | Side‑panel for node details |

**Suggested CSS skeleton** (copy‑paste into `frontend/index.css`):
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

:root {
  --c-primary: hsl(210,55%,55%);
  --c-accent: hsl(34,85%,55%);
  --c-bg: hsl(0,0%,97%);
  --c-surface: #fff;
  --c-text: #212529;
  --radius: 8px;
  --shadow: 0 4px 12px rgba(0,0,0,.06);
  --font: 'Inter', sans-serif;
}

body {font-family: var(--font); background: var(--c-bg); color: var(--c-text); margin:0;}
header, .navbar {background: var(--c-primary); color:#fff; padding:1rem;}
button {background: var(--c-primary); color:#fff; border:none; border-radius:var(--radius); padding:.5rem 1rem; cursor:pointer; transition:background .2s;}
button:hover {background: var(--c-accent);}
.card {background: var(--c-surface); border-radius:var(--radius); box-shadow: var(--shadow); padding:1rem; margin:1rem 0;}
.panel {position:fixed; top:0; right:0; width:320px; height:100vh; background: rgba(255,255,255,.85); backdrop-filter:blur(8px); overflow-y:auto; padding:1rem; box-shadow:-2px 0 8px rgba(0,0,0,.1);}
```
---

## 3. Authentication Flow
1. **Login** – POST `/auth/login` with `{email, password}` → returns `{access_token, refresh_token, user: {role, email}}`.
2. Store `access_token` in `localStorage`.
3. For every API call, add header `Authorization: Bearer <access_token>`.
4. **Logout** – simply remove the token and reload the page.
5. **RBAC Helper (client‑side)**:
   ```js
   function getUserRole(){
     const token = localStorage.getItem('access_token');
     if(!token) return null;
     const payload = JSON.parse(atob(token.split('.')[1]));
     return payload.role; // Supabase puts the custom claim "role"
   }
   const role = getUserRole();
   // Show/hide UI elements based on role
   const hideFor = {Field_Technician:['Documents','SystemConsole'], Auditor:['Documents','AIChat']};
   hideFor[role]?.forEach(id=>document.getElementById(id).style.display='none');
   ```
---

## 4. API Endpoints (public)
> All routes are under **`/api/v1/`**. Use the same base URL for `fetch`.

| Method | Endpoint | Description | Example Request Body | Example Response |
|--------|----------|-------------|----------------------|------------------|
| **POST** | `auth/login` | JWT login | `{ "email":"manager@plant.com", "password":"Manager@123" }` | `{ "access_token": "...", "refresh_token":"...", "user": {"role":"Plant_Manager","email":"manager@plant.com"}}` |
| **POST** | `auth/register` | Register new user (admin only) | `{ "name":"John", "email":"john@plant.com", "password":"Pass@123", "role":"Field_Technician" }` | `{ "msg":"User created" }` |
| **GET** | `assets/` | List all assets (paginated) | `?limit=20&offset=0` | `{ "data": [{"id":...,"equipment_tag":"E-201","equipment_type":"heat_exchanger","manufacturer":"Alfa Laval","image_url":"https://…"}], "count":150 }` |
| **GET** | `assets/{id}` | Asset detail | – | `{ "id":...,"equipment_tag":"E-201", "image_url":"...", "status":"operational", ... }` |
| **POST** | `assets/{id}/upload-media` | Upload/replace image (RBAC‑protected) – multipart/form‑data `file` | FormData with file | `{ "url":"https://…/assets/…/E-201.png" }` |
| **GET** | `documents/` | List documents / SOPs | `?limit=10` | `{ "data": [{"id":...,"title":"Safety SOP","file_url":"..."}], "count":45 }` |
| **POST** | `documents/` | Create a new document (PDF/IMG) | `{ "title":"…","file":<multipart> }` | `{ "id":...,"file_url":"..." }` |
| **GET** | `failure_events/` | List recent failures | `?limit=10` | `{ "data": [{"failure_id":...,"equipment_tag":"P-201","failure_mode":"Leak","severity":"high"}], "count":30 }` |
| **GET** | `extraction/keywords` | Run NER on a text payload (used by the chat) | `{ "text":"…" }` | `{ "entities":[{"type":"Asset","value":"E‑201"}], "summary":"…" }` |
| **GET** | `graph/topology` | Returns JSON for causal graph (nodes + edges) | – | `{ "nodes":[{"id":"E-201","label":"E‑201","type":"Asset","image_url":"…"}], "edges":[{"from":"E-201","to":"P-201","label":"DEPENDS_ON"}] }` |
| **GET** | `reports/summary` | Dashboard KPI summary | – | `{ "total_assets":150,"critical_failures":7,"open_workorders":12 }` |

### 4.1. Pagination / Filtering Conventions
- `limit` (max 100) and `offset` query params.
- For assets you can also filter by `type`, `manufacturer`, `status` e.g. `?type=heat_exchanger&status=active`.
- For failures you can filter by `severity` and date range: `?severity=high&from=2024-01-01&to=2024-12-31`.

---

## 5. UI Component Blueprint
Below is a **component map**; each component should be a self‑contained `.js` module that fetches its data and renders itself.

| Component | Purpose | API Used | RBAC Visibility |
|-----------|---------|----------|-----------------|
| **HeaderBar** | Top navigation (logo, role badge, logout) | – | Always visible |
| **SideNav** | Tabs: *Dashboard, Assets, Documents, Failures, Graph, System Console, AI Agent Chat* | – | Hide per RBAC (see Section 6) |
| **AssetCard** | Grid card showing asset image, tag, type, status | `GET /assets/{id}` | All roles (image read‑only) |
| **AssetDetailPanel** | Slide‑in panel when clicking a node/card – shows large image, specs, edit button (if allowed) | `GET /assets/{id}` + `POST /assets/{id}/upload-media` | Edit button only for Manager/Engineer/Admin |
| **CausalGraph** | Vis.js or React‑Flow canvas with `circularImage` nodes | `GET /graph/topology` | All roles (read‑only) |
| **FailureTable** | Paginated table of recent failures | `GET /failure_events` | All roles (view only) |
| **DocumentUploader** | Form to upload SOP/Manual (PDF/Image) | `POST /documents/` | Only Manager/Engineer/Admin |
| **RBACBadge** | Small badge on top‑right: `Role Profile: <role> (<email>)` | – | All roles |
| **Toast/Notification** | Success/Error feedback for all async actions | – | All roles |

### 5.1. Example Fetch Wrapper (ES6)
```js
export async function apiFetch(path, {method='GET', body=null, params={}}={}){
  const token = localStorage.getItem('access_token');
  const url = new URL(`http://127.0.0.1:8000/api/v1/${path}`);
  Object.entries(params).forEach(([k,v])=>url.searchParams.append(k,v));
  const opts = {method, headers:{'Authorization':`Bearer ${token}`} };
  if(body){
    if(body instanceof FormData){
      opts.body = body; // multipart, let browser set headers
    } else {
      opts.headers['Content-Type']='application/json';
      opts.body = JSON.stringify(body);
    }
  }
  const resp = await fetch(url, opts);
  if(!resp.ok){
    const err = await resp.json();
    throw new Error(err.detail||resp.statusText);
  }
  return resp.json();
}
```
Use it like:
```js
import {apiFetch} from './utils.js';
apiFetch('assets', {params:{limit:20}}).then(data=>renderGrid(data.data));
```
---

## 6. RBAC‑Aware UI Rules (Frontend Only)
| Role | Tabs/Pages Visible | Special UI Controls |
|------|-------------------|----------------------|
| **Plant_Manager** | All tabs (Dashboard, Assets, Documents, Failures, Graph, System Console, AI Agent Chat) | Can upload/replace images, can add new assets & documents |
| **Maintenance_Engineer** | Same as Manager | Can upload images, edit asset status |
| **Admin** | All tabs | Full CRUD on every entity |
| **Field_Technician** | Dashboard, Assets, Failures, Graph, AI Agent Chat | No Document or System Console tabs; cannot upload images |
| **Auditor** | Dashboard, Assets, Failures, Graph | No Document, System Console, or AI Chat tabs |

**Implementation tip** – keep a lookup map in a single JS file and apply it once after login:
```js
const UI_MAP = {
  Plant_Manager:      ['dashboard','assets','documents','failures','graph','system','ai'],
  Maintenance_Engineer:['dashboard','assets','documents','failures','graph','system','ai'],
  Admin:              ['dashboard','assets','documents','failures','graph','system','ai'],
  Field_Technician:   ['dashboard','assets','failures','graph','ai'],
  Auditor:            ['dashboard','assets','failures','graph']
};
function applyRBAC(){
  const role = getUserRole();
  const allowed = UI_MAP[role]||[];
  document.querySelectorAll('.tab').forEach(t=>{
    const id = t.dataset.id; // e.g. "documents"
    t.style.display = allowed.includes(id) ? 'block' : 'none';
  });
}
```
---

## 7. Styling & Interaction Details (Premium Feel)
1. **Micro‑animations** – use CSS `transition` for hover effects on cards (scale 1.03) and a subtle `box-shadow` lift.
2. **Dark‑mode toggle** – optional, but we recommend a toggle that swaps `--c-bg` to `hsl(210,10%,10%)` and `--c-surface` to `hsl(210,10%,15%)`.
3. **Fit‑View button** – on the graph toolbar, call `network.fit()` with easing to center the graph.
4. **Hover tooltips** – display edge label (`DEPENDS_ON`, `CAUSED_BY`) using a lightweight library like Tippy.js.
5. **Responsive grid** – CSS Grid `repeat(auto-fill, minmax(260px,1fr))` for asset cards.
6. **File upload UI** – drag‑and‑drop zone with border `2px dashed var(--c-primary)`; on hover change to solid accent.
7. **Toast component** – use CSS animation `slide-down` + auto‑dismiss after 4 s.

---

## 8. Folder Structure Recommendation (frontend)
```
frontend/
├─ index.html               # entry point
├─ index.css                # global styles (design system)
├─ assets/                  # static icons, placeholder images
├─ js/
│   ├─ utils.js            # apiFetch, RBAC helper, date formatters
│   ├─ components/
│   │   ├─ HeaderBar.js
│   │   ├─ SideNav.js
│   │   ├─ AssetCard.js
│   │   ├─ AssetDetailPanel.js
│   │   ├─ CausalGraph.js
│   │   └─ …
│   └─ app.js              # main entry – bootstrap UI after login
└─ index.html loads `js/app.js` as a module
```
All modules can be written as **ES modules** (`type="module"`) and will import the shared `utils.js`.
---

## 9. Quick Development Checklist
- [ ] Verify Supabase URL and service‑role key are present in `.env` (backend) and `frontend/.env.js` (optional).
- [ ] Implement login page that stores JWT and redirects to `dashboard.html`.
- [ ] Build the **SideNav** component using the RBAC map.
- [ ] Connect **AssetCard** grid to `GET /assets/` and display `image_url` where present.
- [ ] Add **AssetDetailPanel** with image upload button (`POST /assets/{id}/upload-media`).
- [ ] Wire up **CausalGraph** using Vis.js – nodes should use `shape: 'circularImage'` and pull `image_url`.
- [ ] Create **FailureTable** with pagination controls.
- [ ] Add **DocumentUploader** (only visible to allowed roles).
- [ ] Test all role scenarios by swapping JWT payloads.
- [ ] Polish UI: gradients, micro‑animations, glass‑morphism overlay, responsive breakpoints.
- [ ] Run `npm run dev` (if you switch to Vite) or just open `frontend/index.html`.

---

## 10. Helpful External Resources
- **Vis.js network docs** – <https://visjs.github.io/vis-network/docs/network/>
- **Supabase JS client** – <https://supabase.com/docs/reference/javascript>
- **Tippy.js** for tooltips – <https://atomiks.github.io/tippyjs/>
- **Google Fonts – Inter** – <https://fonts.google.com/specimen/Inter>

---

*Prepared by the Antigravity AI coding assistant. This guide should give the frontend developer everything needed to start building a modern, visually striking interface that respects the existing RBAC logic.*
