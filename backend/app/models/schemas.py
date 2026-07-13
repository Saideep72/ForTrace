import re
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

# Define allowed roles in the FortTrace application for strict validation
UserRole = Literal[
    "Plant_Manager",
    "Maintenance_Engineer",
    "Safety_Officer",
    "Field_Technician",
    "Quality_Engineer",
    "Auditor",
    "Admin"
]

# Define allowed asset status values
AssetStatus = Literal["active", "standby", "maintenance", "decommissioned"]


# =====================================================================
# AUTH & USER SCHEMAS
# =====================================================================

class UserBase(BaseModel):
    """
    Base user fields shared across requests and responses.
    """
    email: EmailStr = Field(..., description="Unique email address of the user")
    full_name: str = Field(..., description="Full name of the user")
    role: UserRole = Field(..., description="The role assigned to the user defining system access")


class UserCreate(UserBase):
    """
    Schema for user registration requests. Enforces strict password complexity.
    """
    password: str = Field(..., min_length=8, description="Cleartext password, minimum 8 characters")

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """
        Enforce strong password validation requirements:
        - Minimum 8 characters (handled by Pydantic min_length)
        - At least 1 uppercase letter
        - At least 1 lowercase letter
        - At least 1 digit
        - At least 1 special character
        """
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character.")
        return v


class UserResponse(UserBase):
    """
    Schema for public user profile returns, omitting sensitive credentials.
    """
    user_id: str = Field(..., description="Unique identifier for the user (typically UUID)")
    created_at: datetime = Field(..., description="Timestamp of when the user profile was created")
    is_active: bool = Field(..., description="Whether the user account is currently active")

    model_config = {
        "from_attributes": True
    }


class UserLogin(BaseModel):
    """
    Schema for credentials login request.
    """
    email: EmailStr = Field(..., description="Email address associated with the user account")
    password: str = Field(..., description="User password")


class Token(BaseModel):
    """
    Schema representing JWT authentication credentials response.
    """
    access_token: str = Field(..., description="Cryptographically signed access token string")
    refresh_token: str = Field(..., description="JWT refresh token to generate new access tokens")
    token_type: str = Field("bearer", description="Token authentication scheme")
    expires_in: int = Field(..., description="Lifetime of the access token in seconds")
    user_role: str = Field(..., description="User role to load frontend permissions dynamic configuration")


class TokenData(BaseModel):
    """
    Schema for internal representations of decoded access token payloads.
    """
    user_id: Optional[str] = Field(None, description="Decoded user unique identifier")
    email: Optional[str] = Field(None, description="Decoded email address")
    role: Optional[str] = Field(None, description="Decoded role string")


class RefreshTokenRequest(BaseModel):
    """
    Payload schema to request access token refresh.
    """
    refresh_token: str = Field(..., description="Active JWT refresh token")


class PasswordResetRequest(BaseModel):
    """
    Payload schema to request password reset code.
    """
    email: EmailStr = Field(..., description="Email address of the account to reset")


class PasswordResetConfirm(BaseModel):
    """
    Payload schema to confirm password reset using verification token.
    """
    email: EmailStr = Field(..., description="Email address associated with the account")
    token: str = Field(..., description="Verification code sent to the email")
    new_password: str = Field(..., min_length=8, description="New strong password, minimum 8 characters")

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        """
        Enforce strong password validation rules on reset.
        """
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character.")
        return v


# =====================================================================
# ASSET MANAGEMENT SCHEMAS
# =====================================================================

class AssetBase(BaseModel):
    """
    Base properties shared across Asset creation, update, and search responses.
    """
    plant_code: str = Field(..., description="3-letter plant prefix, e.g., REF")
    area_code: str = Field(..., description="2-to-4 letter area code, e.g., HTX or UTIL")
    system_code: str = Field(..., description="3-to-6 character alphanumeric system ID, e.g., R101 or HX306")
    equipment_tag: str = Field(..., description="Equipment identifier, e.g., R-101")
    equipment_type: str = Field(..., description="Classification category, e.g., reactor")
    manufacturer: Optional[str] = Field(None, description="Equipment brand or manufacturer name")
    model_number: Optional[str] = Field(None, description="Manufacturer model number")
    install_date: Optional[str] = Field(None, description="Installation date in YYYY-MM-DD format")
    criticality_rating: int = Field(..., ge=1, le=5, description="System criticality ranking (1 to 5)")
    status: AssetStatus = Field(..., description="Current operational state of the asset")
    location_description: Optional[str] = Field(None, description="Text describing geographic layout or rows")
    gps_lat: Optional[float] = Field(None, description="GPS Latitude coordinate")
    gps_long: Optional[float] = Field(None, description="GPS Longitude coordinate")

    @field_validator("plant_code")
    @classmethod
    def validate_plant_code(cls, v: str) -> str:
        if not re.match(r"^[A-Z]{3}$", v):
            raise ValueError("plant_code must be exactly 3 uppercase alphabetical characters.")
        return v

    @field_validator("area_code")
    @classmethod
    def validate_area_code(cls, v: str) -> str:
        if not re.match(r"^[A-Z]{2,4}$", v):
            raise ValueError("area_code must be 2-to-4 uppercase alphabetical characters.")
        return v

    @field_validator("system_code")
    @classmethod
    def validate_system_code(cls, v: str) -> str:
        if not re.match(r"^[A-Z0-9]{3,6}$", v):
            raise ValueError("system_code must be 3-to-6 alphanumeric uppercase characters.")
        return v


class AssetCreate(AssetBase):
    """
    Schema for creating a new asset.
    """
    pass


class AssetUpdate(BaseModel):
    """
    Schema for updating asset details. Allows partial modifications.
    """
    equipment_tag: Optional[str] = Field(None, description="Equipment identifier, e.g., R-101")
    equipment_type: Optional[str] = Field(None, description="Classification category, e.g., reactor")
    manufacturer: Optional[str] = Field(None)
    model_number: Optional[str] = Field(None)
    install_date: Optional[str] = Field(None)
    criticality_rating: Optional[int] = Field(None, ge=1, le=5)
    status: Optional[AssetStatus] = Field(None)
    location_description: Optional[str] = Field(None)
    gps_lat: Optional[float] = Field(None)
    gps_long: Optional[float] = Field(None)


class AssetResponse(AssetBase):
    """
    Asset response schema including system-generated properties and linked counts.
    """
    uat: str = Field(..., description="Unique Asset Tag generated by system")
    is_active: bool = Field(..., description="Logical activation status (soft delete status)")
    created_at: datetime
    updated_at: datetime
    document_count: int = Field(0, description="Number of active documents associated with this asset")
    work_order_count: int = Field(0, description="Number of active work orders associated with this asset")
    latest_inspection: Optional[dict] = Field(None, description="Latest inspection details if available")

    model_config = {
        "from_attributes": True
    }


class AssetListResponse(BaseModel):
    """
    Paginated search output schema.
    """
    total: int = Field(..., description="Total match count")
    page: int = Field(..., description="Current page number")
    limit: int = Field(..., description="Record limit per page")
    items: list[AssetResponse] = Field(..., description="Matching asset list on current page")


# =====================================================================
# DOCUMENT SCHEMAS
# =====================================================================

DocType = Literal[
    "SOP",
    "OEM_MANUAL",
    "PID",
    "P&ID",
    "WORK_ORDER",
    "INSPECTION_REPORT",
    "REGULATORY_FILING",
    "INCIDENT_REPORT",
    "LESSONS_LEARNED"
]

class DocumentResponse(BaseModel):
    """
    Schema representing document metadata details.
    """
    doc_id: str = Field(..., description="Unique UUID identifier for the document")
    uat: Optional[str] = Field(None, description="Linked Asset UAT identifier")
    title: str = Field(..., description="Descriptive title of the document")
    doc_type: DocType = Field(..., description="The category classification of the document")
    file_path: str = Field(..., description="Storage path location in Supabase bucket")
    file_hash: str = Field(..., description="SHA-256 hash checksum of the file content")
    revision: str = Field("1.0", description="Document revision tag version")
    compliance_scope: Optional[list[str]] = Field(None, description="Linked compliance standard details if any")
    is_active: bool = Field(..., description="Logical activation status (soft delete status)")
    uploaded_at: datetime = Field(..., description="Upload timestamp")
    uploaded_by: Optional[str] = Field(None, description="ID of the user who uploaded the file")

    model_config = {
        "from_attributes": True
    }


class DocumentListResponse(BaseModel):
    """
    Paginated search output schema for documents.
    """
    total: int = Field(..., description="Total match count")
    page: int = Field(..., description="Current page number")
    limit: int = Field(..., description="Record limit per page")
    items: list[DocumentResponse] = Field(..., description="Matching document list")

