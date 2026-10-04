import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from supabase import Client

from app.core.config import settings
from app.core.database import get_db

# Logging
logger = logging.getLogger("fortrace.security")

# Cryptography context for password hashing using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DEFAULT_USER = {
    "id": 1,
    "user_id": "00000000-0000-0000-0000-000000000000",
    "email": "admin@fortrace.com",
    "full_name": "System Administrator",
    "role": "Plant_Manager",
    "is_active": True
}

# OAuth2 Scheme definition for Bearer Token validation
# Set auto_error=False to allow anonymous / unauthenticated access fallback
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    now_utc = datetime.now(timezone.utc)
    if expires_delta:
        expire = now_utc + expires_delta
    else:
        expire = now_utc + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    iat = int(now_utc.timestamp())
    exp = int(expire.timestamp())
    to_encode.update({"iat": iat, "exp": exp})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except Exception:
        return None


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Client = Depends(get_db)
) -> Dict[str, Any]:
    """
    FastAPI dependency that extracts and validates the user from the JWT token.
    If no token is provided or validation fails, defaults to DEFAULT_USER (no login required).

    Args:
        token (Optional[str]): Bearer token passed in the header.
        db (Client): Supabase database client.

    Returns:
        Dict[str, Any]: User profile dictionary.
    """
    if not token:
        return DEFAULT_USER
    
    # 1. Check if token is blacklisted/revoked
    try:
        revocation_check = db.table("revoked_tokens").select("token").eq("token", token).execute()
        if revocation_check.data and len(revocation_check.data) > 0:
            logger.warning("Revoked token presented, falling back to default user.")
            return DEFAULT_USER
    except Exception as exc:
        logger.warning(f"Error checking token revocation status: {exc}")
        return DEFAULT_USER

    # 2. Decode the access token
    payload = decode_access_token(token)
    if payload is None:
        return DEFAULT_USER
    
    user_id: Optional[str] = payload.get("user_id")
    email: Optional[str] = payload.get("email")
    role: Optional[str] = payload.get("role")
    
    if not user_id or not email or not role:
        return DEFAULT_USER
        
    try:
        # Fetch user information from public.users table
        response = db.table("users").select("*").eq("user_id", user_id).execute()
        
        if not response.data or len(response.data) == 0:
            return DEFAULT_USER
            
        user: Dict[str, Any] = response.data[0]
        
        if not user.get("is_active", True):
            return DEFAULT_USER
            
        return user
    except Exception as exc:
        logger.warning(f"Database error in get_current_user: {exc}, using default user.")
        return DEFAULT_USER


def require_role(allowed_roles: list[str]):
    """
    Enforces Role-Based Access Control (RBAC) on routes.
    Returns a dependency function that checks the current authenticated user's role.

    Usage:
        @router.post("/", dependencies=[Depends(require_role(["Admin", "Plant_Manager"]))])
    """
    async def role_checker(
        current_user: Dict[str, Any] = Depends(get_current_user)
    ) -> Dict[str, Any]:
        user_role = current_user.get("role")
        if user_role not in allowed_roles:
            logger.warning(
                f"Access denied: User {current_user.get('email')} with role '{user_role}' "
                f"attempted to access an endpoint requiring: {allowed_roles}."
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Insufficient permissions. Role '{user_role}' is not authorized."
            )
        return current_user
    return role_checker
