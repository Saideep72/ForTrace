# 🚀 Deployment Guide: ForTrace Platform

This guide provides step-by-step instructions on deploying the **ForTrace Backend** on **Railway** and the **ForTrace Frontend** on **Vercel**.

---

## 🏗️ Architecture Overview

* **Backend**: FastAPI web server running Python 3.10+, deployed on **Railway**. Nixpacks is used to automatically build the application, and Uvicorn serves the API endpoints.
* **Frontend**: React + Vite application, deployed on **Vercel** as a static site.
* **Database & Authentication**: **Supabase** (PostgreSQL + Auth), configured via environment variables.
* **AI Engine**: **Groq API** (Llama 3.3 for reasoning, Whisper Large for Speech-to-Text).

---

## 🛠️ Step 1: Deploy the Backend on Railway

Railway is a cloud platform that makes it simple to deploy backends from GitHub repositories.

### 1. Create a New Project on Railway
1. Sign in to your [Railway Dashboard](https://railway.app/).
2. Click **+ New Project** in the upper-right corner.
3. Select **Deploy from GitHub repo**.
4. Choose the repository containing your **ForTrace** code.

### 2. Configure Monorepo Settings
Because the ForTrace codebase is structured as a monorepo containing both `backend/` and `frontend/` folders, you must tell Railway to only compile and deploy the `backend/` subdirectory:
1. Click on the newly created service in the Railway project canvas to open settings.
2. Navigate to the **Settings** tab.
3. Under the **General** section, locate the **Root Directory** setting.
4. Set it to `/backend`.
5. Under the **Build** section, make sure Railway is using **Nixpacks** (default). It will automatically detect `requirements.txt` and install all Python dependencies.
6. Under the **Deploy** section, find the **Start Command** setting and change it to:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

### 3. Add Environment Variables
Navigate to the **Variables** tab of your service and add the following variables:

| Variable Name | Description | Example / Source |
| :--- | :--- | :--- |
| `PORT` | The port the server binds to. | *Railway sets this automatically.* |
| `SUPABASE_URL` | The endpoint of your Supabase project. | `https://your-project-id.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase Client public anonymous key. | From Supabase Project Settings -> API |
| `SUPABASE_SERVICE_KEY` | Supabase Service Role admin secret key. | From Supabase Project Settings -> API |
| `GROQ_API_KEY` | The secret API key to communicate with Groq. | `gsk_...` from Groq Console |
| `SECRET_KEY` | Secret key used to sign JWT auth tokens. | Generate a random 32-character string |
| `ALGORITHM` | Encryption algorithm for JWT signing. | `HS256` (Default) |
| `BACKEND_CORS_ORIGINS` | Permitted origins for incoming HTTP requests. | Set temporarily to `*` or leave blank, then update to your Vercel URL once deployed (e.g., `https://forttrace.vercel.app`). |

### 4. Expose the Public URL
1. Navigate back to the service **Settings** tab.
2. In the **Networking** section, click **Generate Domain** (or set up a custom domain).
3. Copy this generated public URL (e.g., `https://forttrace-backend-production.up.railway.app`). This is your `VITE_API_URL`.

---

## 💻 Step 2: Deploy the Frontend on Vercel

Vercel is optimized for building and hosting frontend frameworks like React and Vite.

### 1. Import the Project in Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/) and click **Add New** -> **Project**.
2. Select the GitHub repository.

### 2. Configure Project Framework and Paths
Vercel needs to know the layout and build settings for the frontend subdirectory:
1. In the configuration wizard, locate the **Root Directory** field and click **Edit**.
2. Select the `frontend` folder and click **Continue**.
3. Under **Framework Preset**, select **Vite** (Vercel should auto-detect this).
4. Expand **Build and Development Settings** and verify they match the following:
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
   * **Install Command**: `npm install`

### 3. Configure Frontend Environment Variables
Before clicking Deploy, expand the **Environment Variables** section and add the API endpoint pointing to your Railway backend:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | The public Railway API domain (e.g., `https://forttrace-backend-production.up.railway.app`). **Ensure there is no trailing slash.** |

### 4. Deploy and Set Up SPA Routing Redirects
1. Click **Deploy**. Vercel will build the frontend assets using Vite and deploy them.
2. Once deployed, note down your production frontend URL (e.g., `https://forttrace-frontend.vercel.app`).

---

## 🔗 Step 3: Connect Frontend and Backend (CORS Handshake)

To prevent the browser from blocking requests with CORS security errors, you must permit the Vercel domain in your Railway backend.

1. Copy the Vercel production deployment URL (e.g., `https://forttrace-frontend.vercel.app`).
2. Go to your **Railway Dashboard**, click on your backend service, and go to **Variables**.
3. Update the `BACKEND_CORS_ORIGINS` variable value to include your Vercel domain. 
   * Multiple domains can be comma-separated.
   * Example: `https://forttrace-frontend.vercel.app,http://localhost:5173`
4. Railway will automatically redeploy the backend with the new CORS permissions.

---

## 🔒 Step 4: Supabase Authentication Redirects (Optional)

If your app uses Supabase for third-party logins or magic links:
1. Log in to the [Supabase Dashboard](https://supabase.com/).
2. Navigate to **Authentication** -> **URL Configuration**.
3. Set your Vercel URL (e.g., `https://forttrace-frontend.vercel.app`) as the **Site URL**.
4. Add any custom redirect wildcards to **Redirect URLs** (e.g., `https://forttrace-frontend.vercel.app/**`).

---

## 🧪 Verification Checklist

After deployment, check that the platform is operational by running these sanity tests:

1. **Backend Health Check:** Open `https://<your-railway-domain>/health` in a browser. It should return:
   ```json
   {
     "status": "healthy",
     "database": "connected"
   }
   ```
2. **FastAPI Swagger Documentation:** Access `https://<your-railway-domain>/docs` to verify that all REST endpoints are listed and active.
3. **Frontend Connection:** Open the Vercel frontend URL, go to the sign-in screen, and verify that login requests succeed. Open your browser console (F12) to ensure there are no CORS or blocked network requests.
