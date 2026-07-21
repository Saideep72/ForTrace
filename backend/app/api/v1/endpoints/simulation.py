import logging
from collections import deque
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.core.database import get_db
from app.core.security import get_current_user

logger = logging.getLogger("forttrace.simulation")
router = APIRouter()

# Base downtime cost per criticality point per hour (USD)
BASE_COST_PER_CRITICALITY_PER_HOUR = 2500

# Estimated minutes to cascade trip based on flow type
FLOW_CASCADE_MINUTES = {
    "process_fluid": 8,
    "cooling_water": 12,
    "steam": 5,
    "fuel_gas": 3,
    "compressed_air": 15,
    "electrical": 2,
    "hydraulic": 6,
    "default": 10
}


@router.post("/cascade-trip", status_code=status.HTTP_200_OK)
async def simulate_cascade_trip(
    payload: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Digital Twin What-If Cascade Stress Tester.

    Simulates what happens when a specific asset trips/fails.
    Traverses the asset dependency network using BFS to find all
    downstream assets that will be affected, estimated time to impact,
    and total financial exposure (downtime cost).

    Payload:
        source_uat: str        - The UAT of the asset that trips
        trip_scenario: str     - Description of what caused the trip (optional)
    """
    source_uat = (payload.get("source_uat") or "").strip()
    trip_scenario = (payload.get("trip_scenario") or "equipment_failure").strip()

    if not source_uat:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="source_uat is required."
        )

    try:
        # 1. Verify source asset exists
        src_res = db.table("assets") \
            .select("uat, equipment_tag, equipment_type, criticality_rating, status, manufacturer") \
            .eq("uat", source_uat) \
            .execute()

        if not src_res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset '{source_uat}' not found."
            )

        source_asset = src_res.data[0]

        # 2. Fetch all dependency relationships
        dep_res = db.table("asset_dependencies") \
            .select("source_uat, target_uat, relationship_type, dependency_type, flow_type, criticality") \
            .execute()

        deps = dep_res.data or []

        # Build adjacency map: source_uat -> [list of {target_uat, flow_type, relationship_type}]
        adjacency: Dict[str, List[Dict]] = {}
        for d in deps:
            src = d.get("source_uat")
            if src not in adjacency:
                adjacency[src] = []
            adjacency[src].append({
                "target_uat": d.get("target_uat"),
                "flow_type": d.get("flow_type") or "default",
                "relationship_type": d.get("relationship_type") or "DEPENDS_ON",
                "criticality": d.get("criticality") or 3
            })

        # 3. BFS traversal from source_uat to find cascade blast radius
        visited = set()
        visited.add(source_uat)
        queue = deque()

        # Enqueue direct dependents
        for neighbor in adjacency.get(source_uat, []):
            target = neighbor["target_uat"]
            if target and target not in visited:
                queue.append({
                    "uat": target,
                    "depth": 1,
                    "via_flow": neighbor["flow_type"],
                    "relationship": neighbor["relationship_type"],
                    "parent_uat": source_uat,
                    "minutes_to_impact": FLOW_CASCADE_MINUTES.get(
                        neighbor["flow_type"], FLOW_CASCADE_MINUTES["default"]
                    )
                })
                visited.add(target)

        blast_radius_uats = []
        while queue:
            node = queue.popleft()
            blast_radius_uats.append(node)

            # Continue BFS for deeper cascade
            if node["depth"] < 4:  # Max 4 hops to prevent infinite loops
                for neighbor in adjacency.get(node["uat"], []):
                    target = neighbor["target_uat"]
                    if target and target not in visited:
                        cascade_minutes = node["minutes_to_impact"] + FLOW_CASCADE_MINUTES.get(
                            neighbor["flow_type"], FLOW_CASCADE_MINUTES["default"]
                        )
                        queue.append({
                            "uat": target,
                            "depth": node["depth"] + 1,
                            "via_flow": neighbor["flow_type"],
                            "relationship": neighbor["relationship_type"],
                            "parent_uat": node["uat"],
                            "minutes_to_impact": cascade_minutes
                        })
                        visited.add(target)

        # 4. Fetch asset details for each blast radius UAT
        blast_radius_details = []
        total_criticality = source_asset.get("criticality_rating") or 3

        for node in blast_radius_uats:
            ar = db.table("assets") \
                .select("uat, equipment_tag, equipment_type, criticality_rating, status, manufacturer") \
                .eq("uat", node["uat"]) \
                .execute()

            asset_detail = ar.data[0] if ar.data else {}
            crit = asset_detail.get("criticality_rating") or 2
            total_criticality += crit

            blast_radius_details.append({
                "uat": node["uat"],
                "equipment_tag": asset_detail.get("equipment_tag", node["uat"]),
                "equipment_type": asset_detail.get("equipment_type", "Unknown"),
                "current_status": asset_detail.get("status", "unknown"),
                "criticality_rating": crit,
                "manufacturer": asset_detail.get("manufacturer", "Unknown"),
                "depth": node["depth"],
                "via_flow_type": node["via_flow"],
                "relationship_type": node["relationship"],
                "estimated_minutes_to_trip": node["minutes_to_impact"],
                "parent_uat": node["parent_uat"]
            })

        # Sort by estimated_minutes_to_trip
        blast_radius_details.sort(key=lambda x: x["estimated_minutes_to_trip"])

        # 5. Financial exposure calculation
        hourly_cost = total_criticality * BASE_COST_PER_CRITICALITY_PER_HOUR
        daily_cost = hourly_cost * 24
        weekly_cost = daily_cost * 7

        # 6. Fetch emergency containment SOP via standard text search
        # Search documents for emergency procedures related to the source asset type
        equipment_type = source_asset.get("equipment_type", "equipment")
        sop_res = db.table("documents") \
            .select("doc_id, title, doc_type, uat") \
            .eq("doc_type", "SOP") \
            .execute()

        containment_sops = []
        for doc in (sop_res.data or []):
            # Match by UAT or general SOPs
            if doc.get("uat") == source_uat:
                containment_sops.append({
                    "doc_id": doc["doc_id"],
                    "title": doc["title"],
                    "doc_type": doc["doc_type"],
                    "relevance": "Direct Asset SOP"
                })

        # 7. Build summary
        severity_level = "CRITICAL" if total_criticality >= 15 else "HIGH" if total_criticality >= 10 else "MODERATE"
        severity_color = "#dc2626" if severity_level == "CRITICAL" else "#f59e0b" if severity_level == "HIGH" else "#3b82f6"

        return {
            "simulation_summary": {
                "source_asset": {
                    "uat": source_uat,
                    "equipment_tag": source_asset.get("equipment_tag", source_uat),
                    "equipment_type": source_asset.get("equipment_type", "Unknown"),
                    "criticality_rating": source_asset.get("criticality_rating", 3),
                    "current_status": source_asset.get("status", "unknown")
                },
                "trip_scenario": trip_scenario,
                "severity_level": severity_level,
                "severity_color": severity_color,
                "total_affected_assets": len(blast_radius_details),
                "max_cascade_depth": max((n["depth"] for n in blast_radius_details), default=0),
                "first_cascade_impact_minutes": blast_radius_details[0]["estimated_minutes_to_trip"] if blast_radius_details else 0,
            },
            "blast_radius": blast_radius_details,
            "financial_exposure": {
                "hourly_cost_usd": hourly_cost,
                "daily_cost_usd": daily_cost,
                "weekly_cost_usd": weekly_cost,
                "total_criticality_score": total_criticality,
                "currency": "USD",
                "basis": f"${BASE_COST_PER_CRITICALITY_PER_HOUR:,}/hr per criticality point across {len(blast_radius_details) + 1} affected assets"
            },
            "containment_sops": containment_sops,
            "immediate_actions": [
                f"Isolate {source_asset.get('equipment_tag', source_uat)} from upstream feed immediately",
                f"Activate bypass procedures for downstream assets in blast radius",
                f"Notify Plant_Manager of cascade risk: {len(blast_radius_details)} assets at risk",
                f"Check emergency shutdown SOP for {source_asset.get('equipment_type', 'equipment')} class",
                f"Estimated financial exposure: ${hourly_cost:,}/hour — prioritize containment"
            ]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cascade simulation error: {e}")
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")


@router.get("/assets-list", status_code=status.HTTP_200_OK)
async def get_assets_for_simulation(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Returns a lightweight list of all active assets for the simulation dropdown."""
    try:
        res = db.table("assets") \
            .select("uat, equipment_tag, equipment_type, criticality_rating, status") \
            .eq("is_active", True) \
            .order("criticality_rating", desc=True) \
            .execute()
        return {"assets": res.data or []}
    except Exception as e:
        logger.error(f"Assets list for simulation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
