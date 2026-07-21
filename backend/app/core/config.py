import os
from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings for ForTrace Backend.
    Loads variables from the environment or a .env file.
    """
    # API Configurations
    PROJECT_NAME: str = "ForTrace Backend"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "1.0.0"

    # Supabase Configuration
    SUPABASE_URL: str = Field(..., description="The URL of the Supabase project")
    SUPABASE_ANON_KEY: str = Field(..., description="The anonymous public key for Supabase client")
    SUPABASE_SERVICE_KEY: str = Field(..., description="The service role key for admin-level Supabase operations")

    # JWT Authentication Configuration
    SECRET_KEY: str = Field(..., description="Secret key used to sign and verify JWT tokens")
    ALGORITHM: str = Field("HS256", description="Algorithm used to encrypt JWT tokens")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(30, description="Expiration duration for the generated access token")

    # Configuration for Pydantic Settings
    # Reads variables from '.env' file first, falling back to environment variables.
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


@lru_cache
def get_settings() -> Settings:
    """
    Returns a cached settings singleton instance.
    Utilizes LRU caching to prevent reading the file system repeatedly.
    """
    return Settings()


# Instantiate a singleton settings instance for global usage
settings = get_settings()
