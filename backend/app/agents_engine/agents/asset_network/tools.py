"""
Asset Network Agent Tools.
Fetches live information from Supabase database (assets, asset_dependencies, alarm_history).
Implements robust fallbacks to mock data if the database is unreachable.
"""
import os
import re
import logging
from dotenv import load_dotenv
from supabase import create_client

logger = logging.getLogger("fortrace.agent_tools")

# Load environment keys
load_dotenv()
# Fallback to search in backend directory if running from different working dirs
backend_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../backend/.env"))
if os.path.exists(backend_env):
    load_dotenv(backend_env)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

db = None
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    try:
        db = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        logger.info("Supabase client initialized successfully for agent tools.")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client for agent tools: {e}")


def _resolve_asset_uat(asset_id: str) -> str:
    """
    Helper to resolve a user-typed asset ID tag (e.g. 'P-201', 'R-101') 
    to its unique database UAT code (e.g. 'REF-HTX-P201-001').
    """
    if not db:
        return asset_id

    try:
        clean_tag = asset_id.strip()
        # 1. Exact match on UAT
        res = db.table("assets").select("uat").eq("uat", clean_tag).execute()
        if res.data:
            return res.data[0]["uat"]

        # 2. Case-insensitive match on equipment_tag
        res = db.table("assets").select("uat, is_active").ilike("equipment_tag", f"%{clean_tag}%").execute()
        if res.data:
            if len(res.data) > 1:
                # Prioritize candidate UATs that actually have relationships
                candidate_uats = [row["uat"] for row in res.data]
                dep_check = db.table("asset_dependencies").select("source_uat, target_uat").execute()
                active_uats = set()
                for dep in dep_check.data:
                    active_uats.add(dep["source_uat"])
                    active_uats.add(dep["target_uat"])
                
                # Check for active assets with connections first
                for candidate in res.data:
                    if candidate["is_active"] and candidate["uat"] in active_uats:
                        return candidate["uat"]
                
                # Fallback to any matching asset with connections (even decommissioned)
                for candidate_uat in candidate_uats:
                    if candidate_uat in active_uats:
                        return candidate_uat
            return res.data[0]["uat"]

        # 3. Clean up dashes and search (e.g., matching 'P201' to 'P-201')
        stripped_tag = re.sub(r'[-\s]', '', clean_tag)
        res = db.table("assets").select("uat, equipment_tag").execute()
        for row in res.data:
            row_stripped = re.sub(r'[-\s]', '', row["equipment_tag"])
            if stripped_tag.lower() in row_stripped.lower() or row_stripped.lower() in stripped_tag.lower():
                return row["uat"]
        
        return asset_id
    except Exception as e:
        logger.warning(f"Failed to resolve asset UAT for '{asset_id}': {e}")
        return asset_id


def get_asset_details(asset_id: str):
    """
    Fetches details of an asset from PostgreSQL.
    """
    if not db:
        return [{
            "asset_id": asset_id,
            "name": "Feed Water Pump (Mock)",
            "status": "Running",
            "location": "Boiler Section",
        }]

    try:
        resolved_uat = _resolve_asset_uat(asset_id)
        res = db.table("assets").select("*").eq("uat", resolved_uat).eq("is_active", True).execute()
        
        if not res.data:
            # Fallback to search again case-insensitively
            res = db.table("assets").select("*").ilike("equipment_tag", f"%{asset_id}%").eq("is_active", True).execute()

        if not res.data:
            return [{
                "asset_id": asset_id,
                "name": "Unknown Equipment",
                "status": "Unknown",
                "location": "N/A",
            }]

        output = []
        for row in res.data:
            name = f"{row['manufacturer'] or ''} {row['equipment_type'].replace('_', ' ').title()}".strip()
            output.append({
                "asset_id": row["equipment_tag"],
                "name": name,
                "status": row["status"].title(),
                "location": row["location_description"] or "Main Area",
                "criticality": row["criticality_rating"],
                "uat": row["uat"]
            })
        return output

    except Exception as e:
        logger.error(f"Error in get_asset_details for '{asset_id}': {e}")
        return [{
            "asset_id": asset_id,
            "name": f"{asset_id} Details (Fallback Mock)",
            "status": "Running",
            "location": "Main Section",
        }]


def get_connected_assets(asset_id: str):
    """
    Queries asset_dependencies to retrieve true upstream and downstream equipment connections.
    """
    if not db:
        # Static mock fallback
        return [
            {"asset_id": "V201", "relationship": "Upstream", "name": "Control Valve"},
            {"asset_id": "HX301", "relationship": "Downstream", "name": "Heat Exchanger"},
            {"asset_id": "T401", "relationship": "Neighbour", "name": "Storage Tank"}
        ]

    try:
        resolved_uat = _resolve_asset_uat(asset_id)
        
        # Query dependencies matching source or target
        dep_res = db.table("asset_dependencies") \
            .select("*") \
            .or_(f"source_uat.eq.{resolved_uat},target_uat.eq.{resolved_uat}") \
            .execute()

        if not dep_res.data:
            return []

        neighbors = []
        neighbor_uats = set()

        for dep in dep_res.data:
            if dep["source_uat"] == resolved_uat:
                rel = "Downstream"
                n_uat = dep["target_uat"]
            else:
                rel = "Upstream"
                n_uat = dep["source_uat"]
            
            neighbor_uats.add(n_uat)
            neighbors.append((n_uat, rel))

        # Fetch neighbor assets metadata
        n_res = db.table("assets") \
            .select("uat, equipment_tag, equipment_type, manufacturer") \
            .in_("uat", list(neighbor_uats)) \
            .execute()
        n_map = {row["uat"]: row for row in n_res.data}

        output = []
        for n_uat, rel in neighbors:
            n_data = n_map.get(n_uat)
            if n_data:
                name = f"{n_data['manufacturer'] or ''} {n_data['equipment_type'].replace('_', ' ').title()}".strip()
                output.append({
                    "asset_id": n_data["equipment_tag"],
                    "relationship": rel,
                    "name": name,
                    "uat": n_uat
                })
        return output

    except Exception as e:
        logger.error(f"Error in get_connected_assets for '{asset_id}': {e}")
        return [
            {"asset_id": "V-103", "relationship": "Upstream", "name": "Control Valve"},
            {"asset_id": "E-201", "relationship": "Downstream", "name": "Heat Exchanger"}
        ]


def get_recent_alerts(asset_id: str):
    """
    Queries alarm_history to list live triggered alarms on this asset.
    """
    if not db:
        # Static mock fallback
        return [
            {"severity": "High", "message": "Abnormal vibration detected on HX301"},
            {"severity": "Medium", "message": "Pressure fluctuation detected on V201"}
        ]

    try:
        resolved_uat = _resolve_asset_uat(asset_id)
        
        # Fetch active or recent alarms (limit 5)
        alarm_res = db.table("alarm_history") \
            .select("*") \
            .eq("uat", resolved_uat) \
            .order("triggered_at", desc=True) \
            .limit(5) \
            .execute()

        output = []
        for alarm in alarm_res.data:
            severity = "High" if alarm["alarm_priority"] == 1 else "Medium" if alarm["alarm_priority"] == 2 else "Low"
            status_str = "Active" if not alarm["reset_at"] else "Resolved"
            output.append({
                "severity": severity,
                "message": f"[{status_str}] {alarm['tag_description']} ({alarm['tag_name']}) triggered {alarm['alarm_type']}: {alarm['alarm_value']} {alarm['unit'] or ''}. Notes: {alarm['resolution_notes'] or 'None'}"
            })
        return output

    except Exception as e:
        logger.error(f"Error in get_recent_alerts for '{asset_id}': {e}")
        return [
            {"severity": "High", "message": "Abnormal vibration detected (Mock Fallback)"}
        ]