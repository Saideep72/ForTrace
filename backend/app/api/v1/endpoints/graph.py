from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.core.database import get_db
from app.core.security import get_current_user

router = APIRouter()

@router.get("/topology", status_code=status.HTTP_200_OK)
async def get_graph_topology(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Returns the complete relational graph topology of the industrial network.
    Includes:
    - Asset Nodes (Boilers, Pumps, Heat Exchangers, etc.)
    - Document Nodes (SOPs, OEM Manuals, P&IDs)
    - Relationship Edges (DEPENDS_ON, FEEDS_INTO, HAS_DOCUMENT)
    Useful for vis.js and graph visualizations.
    """
    try:
        # 1. Fetch active assets
        assets_res = db.table("assets") \
            .select("uat, equipment_tag, equipment_type, status, criticality_rating, manufacturer") \
            .eq("is_active", True) \
            .execute()
        
        # 2. Fetch active documents
        docs_res = db.table("documents") \
            .select("doc_id, uat, title, doc_type") \
            .eq("is_active", True) \
            .execute()
            
        # 3. Fetch asset dependencies
        dep_res = db.table("asset_dependencies") \
            .select("id, source_uat, target_uat, relationship_type, dependency_type, flow_type, criticality") \
            .execute()

        # 4. Fetch failures
        fail_res = db.table("failure_events") \
            .select("failure_id, uat, failure_mode, failure_category, severity, occurrence_date") \
            .execute()

        # 5. Fetch work orders
        wo_res = db.table("work_orders") \
            .select("wo_id, uat, wo_type, priority, description, status") \
            .execute()

        # 6. Fetch inspections
        insp_res = db.table("inspections") \
            .select("inspection_id, uat, inspection_type, findings, severity") \
            .execute()

        # 7. Fetch active alarms
        alarm_res = db.table("alarm_history") \
            .select("alarm_id, uat, tag_name, alarm_type, alarm_priority, triggered_at") \
            .execute()

        nodes = []
        edges = []
        seen_nodes = set()

        # Add Asset Nodes
        for asset in assets_res.data:
            uat = asset["uat"]
            seen_nodes.add(uat)
            nodes.append({
                "id": uat,
                "label": asset["equipment_tag"],
                "group": "assets",
                "properties": {
                    "type": asset["equipment_type"],
                    "status": asset["status"],
                    "criticality": asset["criticality_rating"],
                    "manufacturer": asset["manufacturer"] or "Unknown",
                    "uat": uat
                }
            })

        # Add Document Nodes & Edges
        for doc in docs_res.data:
            doc_id = doc["doc_id"]
            uat = doc["uat"]
            
            nodes.append({
                "id": doc_id,
                "label": doc["title"][:30] + "..." if len(doc["title"]) > 30 else doc["title"],
                "group": "documents",
                "properties": {
                    "doc_type": doc["doc_type"],
                    "doc_id": doc_id
                }
            })

            if uat and uat in seen_nodes:
                edges.append({
                    "id": f"{uat}-has_doc-{doc_id}",
                    "from": uat,
                    "to": doc_id,
                    "label": "HAS_DOCUMENT",
                    "properties": {"relationship_type": "HAS_DOCUMENT"}
                })

        # Add Failure Nodes & Edges
        for fail in fail_res.data:
            fid = fail["failure_id"]
            uat = fail["uat"]
            nodes.append({
                "id": fid,
                "label": f"FAIL: {fail['failure_mode']}",
                "group": "failures",
                "properties": {
                    "mode": fail["failure_mode"],
                    "category": fail["failure_category"],
                    "severity": fail["severity"],
                    "date": fail["occurrence_date"]
                }
            })
            if uat and uat in seen_nodes:
                edges.append({
                    "id": f"{uat}-fail-{fid}",
                    "from": uat,
                    "to": fid,
                    "label": "HAS_FAILURE",
                    "properties": {"relationship_type": "HAS_FAILURE"}
                })

        # Add Work Order Nodes & Edges
        for wo in wo_res.data:
            wid = wo["wo_id"]
            uat = wo["uat"]
            nodes.append({
                "id": wid,
                "label": f"WO: {wo['wo_type']}",
                "group": "work_orders",
                "properties": {
                    "type": wo["wo_type"],
                    "priority": wo["priority"],
                    "description": wo["description"][:50] + "..." if len(wo["description"]) > 50 else wo["description"],
                    "status": wo["status"]
                }
            })
            if uat and uat in seen_nodes:
                edges.append({
                    "id": f"{uat}-wo-{wid}",
                    "from": uat,
                    "to": wid,
                    "label": "HAS_WORK_ORDER",
                    "properties": {"relationship_type": "HAS_WORK_ORDER"}
                })

        # Add Inspection Nodes & Edges
        for insp in insp_res.data:
            iid = insp["inspection_id"]
            uat = insp["uat"]
            nodes.append({
                "id": iid,
                "label": f"INSP: {insp['inspection_type']}",
                "group": "inspections",
                "properties": {
                    "type": insp["inspection_type"],
                    "findings": insp["findings"][:50] + "..." if len(insp["findings"]) > 50 else insp["findings"],
                    "severity": insp["severity"]
                }
            })
            if uat and uat in seen_nodes:
                edges.append({
                    "id": f"{uat}-insp-{iid}",
                    "from": uat,
                    "to": iid,
                    "label": "HAS_INSPECTION",
                    "properties": {"relationship_type": "HAS_INSPECTION"}
                })

        # Add Alarm Nodes & Edges
        for alarm in alarm_res.data:
            aid = alarm["alarm_id"]
            uat = alarm["uat"]
            nodes.append({
                "id": aid,
                "label": f"ALARM: {alarm['alarm_type']}",
                "group": "alarms",
                "properties": {
                    "tag": alarm["tag_name"],
                    "type": alarm["alarm_type"],
                    "priority": alarm["alarm_priority"],
                    "time": alarm["triggered_at"]
                }
            })
            if uat and uat in seen_nodes:
                edges.append({
                    "id": f"{uat}-alarm-{aid}",
                    "from": uat,
                    "to": aid,
                    "label": "HAS_ALARM",
                    "properties": {"relationship_type": "HAS_ALARM"}
                })

        # Add Asset Dependency Edges
        for dep in dep_res.data:
            source = dep["source_uat"]
            target = dep["target_uat"]
            
            if source in seen_nodes and target in seen_nodes:
                edges.append({
                    "id": f"dep-{dep['id']}",
                    "from": source,
                    "to": target,
                    "label": dep["relationship_type"],
                    "properties": {
                        "relationship_type": dep["relationship_type"],
                        "dependency_type": dep["dependency_type"] or "fluid_flow",
                        "criticality": dep["criticality"] or "normal",
                        "flow_type": dep["flow_type"] or "N/A"
                    }
                })

        return {
            "nodes": nodes,
            "edges": edges
        }


    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile graph topology: {str(e)}"
        )

@router.get("/neighbors/{uat}", status_code=status.HTTP_200_OK)
async def get_asset_neighbors(
    uat: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Returns direct upstream and downstream connections for a specific asset UAT,
    along with any active alarms linked to them.
    """
    try:
        # Check target asset exists
        asset_res = db.table("assets").select("*").eq("uat", uat).eq("is_active", True).execute()
        if not asset_res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset with UAT '{uat}' not found."
            )
            
        target_asset = asset_res.data[0]

        # Fetch dependencies where target is source or target
        dep_res = db.table("asset_dependencies") \
            .select("*") \
            .or_(f"source_uat.eq.{uat},target_uat.eq.{uat}") \
            .execute()

        # Compile neighbors list
        upstream = []
        downstream = []
        neighbor_uats = set()

        for dep in dep_res.data:
            if dep["source_uat"] == uat:
                # Downstream connection: Target asset depends on target_uat
                downstream.append({
                    "uat": dep["target_uat"],
                    "relationship": dep["relationship_type"],
                    "details": {
                        "dependency_type": dep["dependency_type"],
                        "flow_type": dep["flow_type"]
                    }
                })
                neighbor_uats.add(dep["target_uat"])
            else:
                # Upstream connection: source_uat feeds into Target
                upstream.append({
                    "uat": dep["source_uat"],
                    "relationship": dep["relationship_type"],
                    "details": {
                        "dependency_type": dep["dependency_type"],
                        "flow_type": dep["flow_type"]
                    }
                })
                neighbor_uats.add(dep["source_uat"])

        # Fetch neighbor assets metadata
        neighbor_assets = {}
        if neighbor_uats:
            n_res = db.table("assets") \
                .select("uat, equipment_tag, equipment_type, status") \
                .in_("uat", list(neighbor_uats)) \
                .execute()
            for na in n_res.data:
                neighbor_assets[na["uat"]] = na

        # Inject equipment details to upstream/downstream maps
        for item in upstream:
            details = neighbor_assets.get(item["uat"], {})
            item["equipment_tag"] = details.get("equipment_tag", "N/A")
            item["equipment_type"] = details.get("equipment_type", "N/A")
            item["status"] = details.get("status", "Unknown")

        for item in downstream:
            details = neighbor_assets.get(item["uat"], {})
            item["equipment_tag"] = details.get("equipment_tag", "N/A")
            item["equipment_type"] = details.get("equipment_type", "N/A")
            item["status"] = details.get("status", "Unknown")

        # Fetch active alarms for this asset
        alarms_res = db.table("alarm_history") \
            .select("alarm_id, tag_name, alarm_type, alarm_value, unit, alarm_priority, triggered_at") \
            .eq("uat", uat) \
            .is_("reset_at", "null") \
            .execute()

        return {
            "asset": {
                "uat": uat,
                "equipment_tag": target_asset["equipment_tag"],
                "equipment_type": target_asset["equipment_type"],
                "status": target_asset["status"]
            },
            "upstream": upstream,
            "downstream": downstream,
            "active_alarms": alarms_res.data
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch neighbor data: {str(e)}"
        )
