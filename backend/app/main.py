import logging
import sys
import os

# Append agents_engine path globally to resolve inner agent imports cleanly
AGENTS_ENGINE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "agents_engine"))
if AGENTS_ENGINE_PATH not in sys.path:
    sys.path.append(AGENTS_ENGINE_PATH)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import supabase_client
from app.api.v1.router import api_router

# Setup logger configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("fortrace.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager that handles startup and shutdown tasks.
    Logs lifecycle transition events.
    """
    logger.info("Initializing ForTrace Backend application services...")
    # Verify DB initialization status at startup
    if supabase_client is not None:
        logger.info("Supabase DB client connection verified at startup.")
    else:
        logger.warning("Supabase DB client not initialized. Configure credentials in .env.")
    
    yield
    
    logger.info("Shutting down ForTrace Backend application services...")


# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered Industrial Knowledge Intelligence Platform Backend API",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Middleware Configuration
# Configured to allow local development frontend server
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "null"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register version 1 sub-routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["System"])
async def health_check():
    """
    Health check endpoint to verify backend service and database availability.
    """
    db_status = "disconnected"
    if supabase_client is not None:
        try:
            # Query the database to verify active connection
            supabase_client.table("users").select("user_id").limit(1).execute()
            db_status = "connected"
        except Exception as exc:
            logger.warning(f"Database connectivity check failed during health check: {exc}")
            db_status = "unreachable"
            
    return {
        "status": "healthy",
        "database": db_status
    }


@app.get("/", tags=["System"])
async def root():
    """
    Root endpoint returning general application info.
    """
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "status": "online",
        "description": "AI-powered Industrial Knowledge Intelligence Platform. Welcome to the ForTrace API Gateway."
    }
