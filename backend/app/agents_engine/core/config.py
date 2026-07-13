"""
Configuration module for the INDRA LangGraph prototype.

This module centralizes all configuration settings for the AI orchestration layer.
It securely loads environment variables and provides sensible defaults.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Dynamically resolve the project root directory to reliably load the .env file
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)


class AppConfig:
    """
    Centralized configuration object for the AI orchestration layer.
    Reads from environment variables and sets MVP-appropriate defaults.
    """
    
    # --- LLM Configuration ---
    # Securely read the API key; it defaults to empty if not found
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Defaulting to a fast, cost-effective model for the hackathon MVP
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    
    # 0.0 is ideal for deterministic, factual industrial responses
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.0"))
    
    # Optional constraint to prevent runaway generation lengths
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "1024"))
    
    # --- System Configuration ---
    # Logging level for the application (e.g., DEBUG, INFO, WARNING)
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")


# Expose a single configuration instance to be imported across the application
config = AppConfig()