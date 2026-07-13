import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.schemas import (
    AssetCreate,
    AssetUpdate,
    AssetResponse,
    AssetListResponse,
)

# Configure logger for asset audits
logger = logging.getLogger("forttrace.assets")

router = APIRouter()


def validate_status_transition(old_status: str, new_status: str) -> None:
    """
    Validates state transition rules for assets.
    Decommissioned assets cannot return to active, standby, or maintenance.
    """
    if old_status == new_status:
        return

    if old_status == "decommissioned" and new_status in ["active", "standby", "maintenance"]:
        logger.warning(f"Illegal asset status transition attempted from '{old_status}' to '{new_status}'.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status transition: A decommissioned asset cannot transition to '{new_status}'."
        )


async def get_asset_aggregations(uat: str, db: Client) -> Dict[str, Any]:
    """
    Queries document and work order counts, and the latest inspection for an asset.
    Handles table-not-found/empty database structures gracefully.
    """
    doc_count = 0
    wo_count = 0
    latest_inspection = None

    # 1. Count linked documents
    try:
        docs_res = db.table("documents").select("doc_id", count="exact").eq("uat", uat).eq("is_active", True).execute()
        if docs_res.count is not None:
            doc_count = docs_res.count
    except Exception as exc:
        logger.debug(f"Could not count documents for {uat} (table may not exist yet): {exc}")

    # 2. Count linked work orders
    try:
        wo_res = db.table("work_orders").select("wo_id", count="exact").eq("uat", uat).execute()
        if wo_res.count is not None:
            wo_count = wo_res.count
    except Exception as exc:
        logger.debug(f"Could not count work orders for {uat}: {exc}")

    # 3. Retrieve latest inspection
    try:
        inspect_res = db.table("inspections").select("*").eq("uat", uat).order("created_at", desc=True).limit(1).execute()
        if inspect_res.data and len(inspect_res.data) > 0:
            latest_inspection = inspect_res.data[0]
    except Exception as exc:
        logger.debug(f"Could not retrieve inspections for {uat}: {exc}")

    return {
        "document_count": doc_count,
        "work_order_count": wo_count,
        "latest_inspection": latest_inspection
    }


@router.post("", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def create_asset(
    asset_in: AssetCreate,
    current_user: Dict[str, Any] = Depends(require_role(["Admin", "Plant_Manager"])),
    db: Client = Depends(get_db)
) -> Dict[str, Any]:
    """
    Creates a new asset with an auto-generated unique UAT.
    
    Restricted to Admin and Plant_Manager roles.
    UAT format: {PLANT_CODE}-{AREA_CODE}-{SYSTEM_CODE}-{SEQUENCE}
    """
    logger.info(f"User {current_user['email']} initiating asset creation for {asset_in.equipment_tag}")

    try:
        # 1. Generate unique sequence sequence number for the UAT
        prefix = f"{asset_in.plant_code}-{asset_in.area_code}-{asset_in.system_code}-"
        
        # Query database to find assets sharing the same plant-area-system prefix
        match_query = db.table("assets").select("uat").like("uat", f"{prefix}%").execute()
        
        next_seq = 1
        if match_query.data:
            sequences = []
            for item in match_query.data:
                parts = item["uat"].split("-")
                if len(parts) == 4:
                    try:
                        sequences.append(int(parts[3]))
                    except ValueError:
                        pass
            if sequences:
                next_seq = max(sequences) + 1

        uat = f"{prefix}{next_seq:03d}"
        logger.info(f"Generated asset UAT tag: {uat}")

        # 2. Insert asset record
        asset_record = asset_in.model_dump()
        asset_record.update({
            "uat": uat,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        })

        response = db.table("assets").insert(asset_record).execute()
        
        if not response.data or len(response.data) == 0:
            logger.error(f"Asset insertion returned empty dataset for UAT: {uat}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create asset record."
            )

        asset_data = response.data[0]
        
        # Merge counts (all zero for new assets)
        asset_data.update({
            "document_count": 0,
            "work_order_count": 0,
            "latest_inspection": None
        })

        logger.info(f"Asset successfully registered in database: {uat}")
        return asset_data

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(f"Unexpected error during asset registration: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred during asset registration."
        )


@router.get("/{uat}", response_model=AssetResponse)
async def get_asset(
    uat: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_db)
) -> Dict[str, Any]:
    """
    Retrieves details for a single asset by UAT. Includes active linked document & work order counts.
    """
    logger.info(f"Asset search query for UAT: {uat} by user {current_user['email']}")

    try:
        res = db.table("assets").select("*").eq("uat", uat).eq("is_active", True).execute()
        if not res.data or len(res.data) == 0:
            logger.warning(f"Asset search failed: UAT not found or inactive: {uat}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset with UAT '{uat}' not found."
            )

        asset_data = res.data[0]
        
        # Retrieve counts and inspections
        aggregations = await get_asset_aggregations(uat, db)
        asset_data.update(aggregations)

        return asset_data

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(f"Error fetching asset {uat}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching asset details."
        )


@router.get("", response_model=AssetListResponse)
async def get_assets(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Records per page"),
    plant: Optional[str] = Query(None, description="Filter by plant prefix"),
    area: Optional[str] = Query(None, description="Filter by area prefix"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by asset status"),
    equipment_type: Optional[str] = Query(None, alias="type", description="Filter by equipment type"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    order: str = Query("asc", pattern="^(asc|desc)$", description="Sort order"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_db)
) -> Dict[str, Any]:
    """
    Retrieves a paginated list of active assets. Supports filtering and sorting.
    """
    logger.info(f"Asset list query from user {current_user['email']}: plant={plant}, area={area}, status={status_filter}")

    try:
        # Build base query
        query = db.table("assets").select("*", count="exact").eq("is_active", True)

        # Apply filters
        if plant:
            query = query.eq("plant_code", plant)
        if area:
            query = query.eq("area_code", area)
        if status_filter:
            query = query.eq("status", status_filter)
        if equipment_type:
            query = query.eq("equipment_type", equipment_type)

        # Apply sorting
        descending = (order == "desc")
        query = query.order(sort_by, desc=descending)

        # Calculate offsets
        offset_start = (page - 1) * limit
        offset_end = offset_start + limit - 1
        query = query.range(offset_start, offset_end)

        res = query.execute()
        total_count = res.count if res.count is not None else 0

        # Construct responses list containing counts
        items_list = []
        for asset in res.data:
            aggregations = await get_asset_aggregations(asset["uat"], db)
            asset.update(aggregations)
            items_list.append(asset)

        return {
            "total": total_count,
            "page": page,
            "limit": limit,
            "items": items_list
        }

    except Exception as exc:
        logger.exception(f"Error listing assets: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while listing assets."
        )


@router.put("/{uat}", response_model=AssetResponse)
async def update_asset(
    uat: str,
    asset_in: AssetUpdate,
    current_user: Dict[str, Any] = Depends(require_role(["Admin", "Plant_Manager", "Maintenance_Engineer"])),
    db: Client = Depends(get_db)
) -> Dict[str, Any]:
    """
    Updates details of an existing asset (partial update). Cannot modify the UAT.
    
    Restricted to Admin, Plant_Manager, and Maintenance_Engineer roles.
    Checks and validates status transitions.
    """
    logger.info(f"Asset update request for {uat} by user {current_user['email']}")

    try:
        # Fetch current record to validate state
        res = db.table("assets").select("*").eq("uat", uat).eq("is_active", True).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset with UAT '{uat}' not found."
            )

        current_asset = res.data[0]

        update_payload = asset_in.model_dump(exclude_unset=True)
        if not update_payload:
            # Nothing to update, return current details
            aggregations = await get_asset_aggregations(uat, db)
            current_asset.update(aggregations)
            return current_asset

        # Validate status transitions
        if "status" in update_payload:
            validate_status_transition(current_asset["status"], update_payload["status"])

        # Timestamp modifications
        update_payload["updated_at"] = datetime.now(timezone.utc).isoformat()

        # Execute database modifications
        response = db.table("assets").update(update_payload).eq("uat", uat).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update asset record."
            )

        updated_asset = response.data[0]
        
        # Merge aggregations
        aggregations = await get_asset_aggregations(uat, db)
        updated_asset.update(aggregations)

        logger.info(f"Asset successfully updated: {uat}")
        return updated_asset

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(f"Unexpected error while updating asset {uat}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the asset."
        )


@router.delete("/{uat}", status_code=status.HTTP_200_OK)
async def delete_asset(
    uat: str,
    current_user: Dict[str, Any] = Depends(require_role(["Admin", "Plant_Manager"])),
    db: Client = Depends(get_db)
) -> Dict[str, str]:
    """
    Performs a soft-delete on an asset by setting is_active=false.
    Cascades is_active=false to all linked documents.
    """
    logger.info(f"Soft delete request for asset {uat} by user {current_user['email']}")

    try:
        # Verify asset exists
        res = db.table("assets").select("uat").eq("uat", uat).eq("is_active", True).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset with UAT '{uat}' not found."
            )

        # 1. Soft delete asset
        db.table("assets").update({"is_active": False, "updated_at": datetime.now(timezone.utc).isoformat()}).eq("uat", uat).execute()

        # 2. Cascade soft-delete to linked documents
        try:
            db.table("documents").update({"is_active": False}).eq("uat", uat).execute()
            logger.info(f"Soft delete cascaded to documents linked with asset: {uat}")
        except Exception as cascade_err:
            logger.warning(f"Soft delete cascade warning: Could not soft-delete linked documents: {cascade_err}")

        logger.info(f"Asset successfully soft-deleted: {uat}")
        return {"detail": f"Asset '{uat}' and its linked documents have been soft-deleted."}

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(f"Unexpected error soft-deleting asset {uat}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the asset."
        )
