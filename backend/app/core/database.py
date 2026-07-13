import logging
from typing import AsyncGenerator
from supabase import create_client, Client
from app.core.config import settings

# Configure logging for database activities
logger = logging.getLogger("forttrace.database")

# Thread-safe global client cache
supabase_client: Client | None = None


def init_supabase() -> Client:
    """
    Initializes the Supabase client using the Service Role Key.
    Ensures connection settings are valid and logs initialization events.
    """
    global supabase_client
    if supabase_client is not None:
        return supabase_client

    try:
        # Validate configuration values
        if not settings.SUPABASE_URL or settings.SUPABASE_URL.startswith("https://your-supabase-project-id"):
            raise ValueError("SUPABASE_URL is unconfigured or has placeholder value")
        if not settings.SUPABASE_SERVICE_KEY or "here" in settings.SUPABASE_SERVICE_KEY:
            raise ValueError("SUPABASE_SERVICE_KEY is unconfigured or has placeholder value")

        supabase_client = create_client(
            supabase_url=settings.SUPABASE_URL,
            supabase_key=settings.SUPABASE_SERVICE_KEY
        )
        logger.info("Supabase Client initialized successfully with Service Role Key.")
        return supabase_client
    except Exception as e:
        logger.error(f"Graceful connection error: Failed to initialize Supabase client. Reason: {e}")
        # Return a shell or raise depending on severity. We raise here to alert on invalid credentials.
        raise RuntimeError(f"Database connection setup failed: {e}") from e


# Pre-initialize at module load time
try:
    init_supabase()
except Exception as err:
    logger.warning(
        f"Database client not pre-initialized on import. Will initialize lazily when endpoints are accessed. Details: {err}"
    )


async def get_db() -> AsyncGenerator[Client, None]:
    """
    Dependency Injection function to obtain the Supabase client database context.
    Yields:
        Client: An active Supabase client instance.
    """
    try:
        client = init_supabase()
        yield client
    except Exception as e:
        logger.critical(f"Database dependency resolution failed: {e}")
        raise
