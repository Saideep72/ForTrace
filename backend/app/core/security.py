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

# OAuth2 Scheme definition for Bearer Token validation
# The tokenUrl points to our login endpoint prefix
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


def get_password_hash(password: str) -> str:
    """
    Hashes a cleartext password using bcrypt.

    Args:
        password (str): Plain text password.

    Returns:
        str: Bcrypt hashed password.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a cleartext password against a bcrypt hash.

    Args:
        plain_password (str): Plain text password to check.
        hashed_password (str): The correct bcrypt hash.

    Returns:
        bool: True if passwords match, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Generates a signed JWT access token.

    Args:
        data (Dict[str, Any]): Claims payload to embed in the token.
        expires_delta (Optional[timedelta]): Custom token expiration delta.

    Returns:
        str: Signed JWT token string.
    """
    from datetime import timezone
    to_encode = data.copy()
    now_utc = datetime.now(timezone.utc)
    
    if expires_delta:
        expire = now_utc + expires_delta
    else:
        expire = now_utc + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    iat = int(now_utc.timestamp())
    exp = int(expire.timestamp())
    
    to_encode.update({
        "iat": iat,
        "exp": exp
    })
    
    logger.info(
        f"Token created at {datetime.fromtimestamp(iat, timezone.utc).isoformat()} (iat: {iat}), "
        f"expires at {datetime.fromtimestamp(exp, timezone.utc).isoformat()} (exp: {exp})"
    )
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and validates a JWT token. Handles invalid and expired tokens.

    Args:
        token (str): JWT token.

    Returns:
        Optional[Dict[str, Any]]: Decoded payload if token is valid and unexpired; None otherwise.
    """
    from datetime import timezone
    try:
        # Extract unverified claims for verbose logging if verification fails
        unverified_payload = jwt.get_unverified_claims(token)
    except Exception as parse_err:
        logger.warning(f"Token could not be parsed: {parse_err}")
        return None

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError as e:
        current_ts = int(datetime.now(timezone.utc).timestamp())
        logger.warning(
            f"Token validation failed: Signature has expired. "
            f"Token exp was {unverified_payload.get('exp')} (current UTC time: {current_ts}, "
            f"difference: {current_ts - unverified_payload.get('exp', 0)} seconds ago)"
        )
        return None
    except JWTError as e:
        logger.warning(f"Failed token validation attempt: {e}")
        return None


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Client = Depends(get_db)
) -> Dict[str, Any]:
    """
    FastAPI dependency that extracts and validates the user from the JWT token.
    Queries the revoked_tokens blacklist to verify the token hasn't been logged out,
    and queries the Supabase public.users table to confirm user existence.

    Args:
        token (str): Bearer token passed in the header.
        db (Client): Supabase database client.

    Returns:
        Dict[str, Any]: User profile dictionary.

    Raises:
        HTTPException: 401 Unauthorized if the credentials fail validation or the token is revoked.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # 1. Check if token is blacklisted/revoked
    try:
        revocation_check = db.table("revoked_tokens").select("token").eq("token", token).execute()
        if revocation_check.data and len(revocation_check.data) > 0:
            logger.warning("Access denied: Revoked token was presented.")
            raise credentials_exception
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error checking token revocation status: {exc}")
        raise credentials_exception

    # 2. Decode the access token
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: Optional[str] = payload.get("user_id")
    email: Optional[str] = payload.get("email")
    role: Optional[str] = payload.get("role")
    
    if not user_id or not email or not role:
        raise credentials_exception
        
    try:
        # Fetch user information from public.users table (uses the service role client, which bypasses RLS)
        response = db.table("users").select("*").eq("user_id", user_id).execute()
        
        # Verify the record exists and matches
        if not response.data or len(response.data) == 0:
            logger.warning(f"Valid token presented for non-existent user: {user_id}")
            raise credentials_exception
            
        user: Dict[str, Any] = response.data[0]
        
        # Check active status
        if not user.get("is_active", True):
            logger.warning(f"Inactive user blocked from system access: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated"
            )
            
        return user
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Unexpected database retrieval error in get_current_user: {exc}")
        raise credentials_exception


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
