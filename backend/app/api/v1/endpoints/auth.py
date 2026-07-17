import logging
import uuid
import random
import string
from datetime import datetime, timedelta, timezone
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.security.utils import get_authorization_scheme_param
from supabase import Client

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
    get_current_user,
)
from app.models.schemas import (
    UserCreate,
    UserResponse,
    Token,
    RefreshTokenRequest,
    PasswordResetRequest,
    PasswordResetConfirm,
)

# Configure logger for authentication auditing
logger = logging.getLogger("forttrace.auth")

router = APIRouter()

# In-memory code store for mock forgot-password flow testing
reset_codes: Dict[str, str] = {}


@router.get("/debug-db", tags=["Authentication"])
async def debug_db(user_id: str, db: Client = Depends(get_db)):
    """
    Temporary debug endpoint to query public.users using the application client.
    """
    try:
        res = db.table("users").select("*").eq("user_id", user_id).execute()
        return {
            "queried_user_id": user_id,
            "supabase_url": settings.SUPABASE_URL,
            "data": res.data
        }
    except Exception as e:
        return {
            "error": str(e),
            "supabase_url": settings.SUPABASE_URL
        }


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: Client = Depends(get_db)
) -> Dict[str, Any]:
    """
    Registers a new user in the system.
    
    Checks if the email is already registered in public.users. Registers the user
    in Supabase Auth using the admin API, then inserts user profile information
    into public.users.
    """
    logger.info(f"Registration attempt initiated for email: {user_in.email} with role: {user_in.role}")
    if user_in.role in ["Expert_Engineer", "Admin"]:
        logger.warning(f"Registration blocked: Role '{user_in.role}' is not allowed to self-register: {user_in.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Self-registration is disabled for security-critical role '{user_in.role}'. Please contact system administrator."
        )

    try:
        # Check if email already exists in Supabase public.users table
        existing_check = db.table("users").select("email").eq("email", user_in.email).execute()
        
        if existing_check.data and len(existing_check.data) > 0:
            logger.warning(f"Registration conflict: Email already exists: {user_in.email}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email address is already registered."
            )

        # Create user in Supabase Auth via Admin client
        try:
            auth_response = db.auth.admin.create_user({
                "email": user_in.email,
                "password": user_in.password,
                "email_confirm": True,
                "user_metadata": {
                    "full_name": user_in.full_name,
                    "role": user_in.role
                }
            })
        except Exception as auth_err:
            logger.error(f"Supabase Auth user creation failed for {user_in.email}: {auth_err}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Registration failed on authorization server: {str(auth_err)}"
            )

        new_user_id = auth_response.user.id

        user_record = {
            "user_id": new_user_id,
            "email": user_in.email,
            "full_name": user_in.full_name,
            "role": user_in.role,
            "plant_access": [],
            "area_access": [],
            "is_active": True,
        }

        # Insert user profile into public.users
        response = db.table("users").insert(user_record).execute()
        
        if not response.data or len(response.data) == 0:
            logger.error(f"Database insertion returned empty dataset for email: {user_in.email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User creation failed due to a database sync issue."
            )

        created_user: Dict[str, Any] = response.data[0]
        logger.info(f"User registered successfully: {user_in.email} with user_id: {new_user_id}")
        return created_user

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(f"Unexpected error encountered during registration for {user_in.email}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred during registration."
        )


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Client = Depends(get_db)
) -> Dict[str, Any]:
    """
    Authenticates a user, saves a refresh token in the DB, and generates a JWT access token.
    """
    email = form_data.username
    logger.info(f"Login attempt initiated for email: {email}")

    try:
        # Authenticate against Supabase Auth using a temporary anon client.
        try:
            from supabase import create_client as create_temp_client
            temp_client = create_temp_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
            auth_res = temp_client.auth.sign_in_with_password({
                "email": email,
                "password": form_data.password
            })
        except Exception as auth_err:
            logger.warning(f"Login failed: Invalid credentials or password error for email: {email}. Details: {auth_err}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = auth_res.user.id
        logger.info(f"Authenticating user ID: {user_id} (email: {email})")

        # Fetch user record from public.users (uses the service role client, which bypasses RLS)
        user_check = db.table("users").select("*").eq("user_id", user_id).execute()
        logger.info(f"Initial profile lookup for {user_id} returned: {user_check.data}")

        if not user_check.data or len(user_check.data) == 0:
            logger.info(f"Profile not found for user ID: {user_id}. Auto-initializing public profile.")
            
            # Extract metadata from auth session or construct default values
            auth_user = auth_res.user
            user_metadata = getattr(auth_user, "user_metadata", {}) or {}
            full_name = user_metadata.get("full_name") or email.split("@")[0]
            role = user_metadata.get("role") or "Field_Technician"
            
            user_record = {
                "user_id": user_id,
                "email": email,
                "full_name": full_name,
                "role": role,
                "plant_access": [],
                "area_access": [],
                "is_active": True,
            }
            
            try:
                insert_res = db.table("users").insert(user_record).execute()
                if insert_res.data and len(insert_res.data) > 0:
                    user = insert_res.data[0]
                    logger.info(f"Dynamically auto-created user profile for: {email}")
                else:
                    raise Exception("Insertion returned empty dataset.")
            except Exception as insert_err:
                logger.warning(f"Profile insert failed, checking if it was a duplicate key error: {insert_err}")
                
                # Try fetching again in case it was created concurrently or already exists
                retry_check = db.table("users").select("*").eq("user_id", user_id).execute()
                if retry_check.data and len(retry_check.data) > 0:
                    user = retry_check.data[0]
                    logger.info(f"Successfully recovered profile from database for: {email}")
                else:
                    logger.error(f"Failed to auto-create and recover user profile: {insert_err}")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="User profile could not be auto-initialized."
                    )
        else:
            user = user_check.data[0]

        # Check if user is active
        if not user.get("is_active", True):
            logger.warning(f"Login failed: Inactive account blocked for email: {email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is deactivated."
            )

        # Generate JWT access token
        token_data = {
            "user_id": user["user_id"],
            "email": user["email"],
            "role": user["role"]
        }
        access_token = create_access_token(data=token_data)
        
        # Generate new refresh token and persist in the database
        refresh_token = str(uuid.uuid4())
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        db.table("refresh_tokens").insert({
            "user_id": user["user_id"],
            "token": refresh_token,
            "expires_at": expires_at.isoformat()
        }).execute()

        expires_seconds = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        logger.info(f"Login successful: Token generated for user_id: {user['user_id']}")
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": expires_seconds,
            "user_role": user["role"]
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(f"Unexpected error encountered during login validation for {email}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred during login verification."
        )


@router.post("/refresh", response_model=Token)
async def refresh(
    payload: RefreshTokenRequest,
    db: Client = Depends(get_db)
) -> Dict[str, Any]:
    """
    Validates a refresh token and generates a new access token + refresh token pair (rotation).
    """
    token = payload.refresh_token
    logger.info("Access token refresh requested.")

    try:
        # Query active refresh token
        res = db.table("refresh_tokens").select("*").eq("token", token).execute()
        if not res.data or len(res.data) == 0:
            logger.warning("Token refresh failed: Refresh token not found in database.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token."
            )

        token_record = res.data[0]

        # Check if token is revoked or expired
        expires_at = datetime.fromisoformat(token_record["expires_at"].replace("Z", "+00:00"))
        if token_record["is_revoked"] or expires_at < datetime.now(timezone.utc):
            logger.warning("Token refresh failed: Token is revoked or has expired.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token."
            )

        user_id = token_record["user_id"]

        # Fetch profile
        user_check = db.table("users").select("*").eq("user_id", user_id).execute()
        if not user_check.data or len(user_check.data) == 0:
            logger.warning(f"Token refresh failed: Profile not found for user ID: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User profile not initialized."
            )

        user = user_check.data[0]

        if not user.get("is_active", True):
            logger.warning(f"Token refresh failed: Account deactivated for user: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is deactivated."
            )

        # Rotate token: Delete old refresh token from DB
        db.table("refresh_tokens").delete().eq("token_id", token_record["token_id"]).execute()

        # Generate new access + refresh tokens
        token_data = {
            "user_id": user["user_id"],
            "email": user["email"],
            "role": user["role"]
        }
        new_access_token = create_access_token(data=token_data)
        new_refresh_token = str(uuid.uuid4())
        new_expires_at = datetime.now(timezone.utc) + timedelta(days=7)

        db.table("refresh_tokens").insert({
            "user_id": user["user_id"],
            "token": new_refresh_token,
            "expires_at": new_expires_at.isoformat()
        }).execute()

        expires_seconds = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        logger.info(f"Token refresh successful for user_id: {user['user_id']}")

        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": expires_seconds,
            "user_role": user["role"]
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(f"Unexpected error during refresh token processing: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred during token refresh."
        )


@router.post("/logout")
async def logout(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_db)
) -> Dict[str, str]:
    """
    Revokes the current JWT access token (adds to blacklist) and deletes all associated refresh tokens.
    """
    auth_header = request.headers.get("Authorization")
    scheme, token = get_authorization_scheme_param(auth_header)
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bearer token not found in Authorization header."
        )

    try:
        # 1. Add current access token to blacklist/revoked_tokens
        db.table("revoked_tokens").insert({"token": token}).execute()

        # 2. Clear all refresh tokens for this user
        db.table("refresh_tokens").delete().eq("user_id", current_user["user_id"]).execute()

        logger.info(f"User {current_user['email']} successfully logged out. Tokens blacklisted.")
        return {"detail": "Logged out successfully."}
    except Exception as exc:
        logger.exception(f"Logout failed for user {current_user.get('user_id')}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred during logout."
        )


@router.post("/forgot-password")
async def forgot_password(
    payload: PasswordResetRequest,
    db: Client = Depends(get_db)
) -> Dict[str, str]:
    """
    Initiates password reset process. Generates and logs a 6-character reset token.
    """
    email = payload.email
    logger.info(f"Password reset request received for email: {email}")

    try:
        # Confirm user profile exists
        res = db.table("users").select("user_id").eq("email", email).execute()
        if not res.data or len(res.data) == 0:
            logger.warning(f"Forgot password attempt on non-existent account: {email}")
            return {"detail": "If the email is registered, a password reset link has been logged/sent."}

        # Generate mock reset code
        reset_token = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
        reset_codes[email] = reset_token

        # Output mock log
        logger.info(
            f"\n=======================================================\n"
            f"MOCK EMAIL SERVICE: Password reset requested for {email}\n"
            f"Verification Token Code: {reset_token}\n"
            f"======================================================="
        )

        return {"detail": "Password reset code generated and logged to backend console."}
    except Exception as exc:
        logger.exception(f"Forgot password request failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred."
        )


@router.post("/reset-password")
async def reset_password(
    payload: PasswordResetConfirm,
    db: Client = Depends(get_db)
) -> Dict[str, str]:
    """
    Resets the user password in Supabase Auth using verification code/token.
    """
    email = payload.email
    token = payload.token
    new_password = payload.new_password

    logger.info(f"Confirming password reset for: {email}")

    # Validate code
    if email not in reset_codes or reset_codes[email] != token:
        logger.warning(f"Password reset attempt failed: Invalid token code for {email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token."
        )

    try:
        # Find user UUID
        res = db.table("users").select("user_id").eq("email", email).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )
        user_id = res.data[0]["user_id"]

        # Update password on Supabase Auth using Admin credentials
        db.auth.admin.update_user_by_id(
            user_id,
            {"password": new_password}
        )

        # Evict token code from cache
        reset_codes.pop(email, None)

        logger.info(f"Password reset successful for user ID: {user_id}")
        return {"detail": "Password has been reset successfully."}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(f"Password reset validation failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred during password reset."
        )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Retrieves the profile of the currently authenticated user.
    
    Requires a valid JWT bearer token in the Authorization header.
    """
    logger.debug(f"Retrieved profile query for user_id: {current_user.get('user_id')}")
    return current_user
