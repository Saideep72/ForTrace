"""
Asset Network Agent.

This module implements the Asset Network Agent for the Economic Times Hackathon prototype.
It answers questions regarding relationships between industrial assets, such as upstream/downstream
connections, neighbours, and active alerts.

This agent is integrated into the LangGraph AI orchestration layer.
"""

import json
import re
from typing import Dict, Any

from graph.state import GraphState
from core.llm import llm, clean_response
from core.confidence import compute_confidence
from langgraph.graph import StateGraph, START, END
from agents.asset_network.tools import (
    get_asset_details,
    get_connected_assets,
    get_recent_alerts,
)
from prompts.asset_network_prompt import EXTRACTION_PROMPT, SYNTHESIS_PROMPT

def _extract_intent_and_asset(query: str) -> dict:
    """
    Extracts the target asset ID and the user intent from the user query.
    Uses regex as a first pass, falling back to LLM if extraction fails.
    
    The user intent could be one of:
    - "connected_assets"
    - "upstream_dependency"
    - "downstream_impact"
    - "neighbouring_assets"
    - "active_alerts"
    - "general_info"
    """
    # 1. Simple regex fallback for asset extraction (e.g. looking for P101, Pump P101, V-123)
    asset_id_match = re.search(r'\b(Pump\s+[A-Z0-9]+|[A-Z]+-?\d+)\b', query, re.IGNORECASE)
    
    # 2. Simple keyword matching for intent
    intent = "general_info"
    query_lower = query.lower()
    if "connect" in query_lower or "relation" in query_lower or "depend" in query_lower:
        intent = "connected_assets"
    elif "upstream" in query_lower:
        intent = "upstream_dependency"
    elif "downstream" in query_lower or "impact" in query_lower:
        intent = "downstream_impact"
    elif "neighbour" in query_lower or "neighbor" in query_lower:
        intent = "neighbouring_assets"
    elif "alert" in query_lower or "warning" in query_lower or "active" in query_lower:
        intent = "active_alerts"

    if asset_id_match:
        # If we successfully parsed it, return right away
        # Taking the matched part as the ID
        asset_id = asset_id_match.group(1).strip()
        return {"asset_id": asset_id, "intent": intent}
        
    # 3. Fallback to LLM if basic parsing fails
    prompt = EXTRACTION_PROMPT.format(query=query)
    
    try:
        response = llm.invoke(prompt)
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        return json.loads(content)
    except Exception as e:
        return {"asset_id": "Unknown", "intent": "general_info"}

def _gather_network_context(asset_id: str, intent: str) -> str:
    """
    Calls placeholder tools to gather relevant data based on the extracted intent.
    """
    if asset_id == "Unknown":
        return "No specific asset ID could be identified in the query."

    # Always fetch basic details
    details = get_asset_details(asset_id)
    context_parts = [f"Asset Details for {asset_id}:\n{details}"]
    
    # Fetch connected assets for relationship intents
    if intent in ["connected_assets", "upstream_dependency", "downstream_impact", "neighbouring_assets"]:
        connections = get_connected_assets(asset_id)
        context_parts.append(f"Network Connections:\n{connections}")
        
    # Fetch alerts if requested or if we are looking at downstream impacts
    if intent in ["active_alerts", "downstream_impact", "connected_assets"]:
        alerts = get_recent_alerts(asset_id)
        context_parts.append(f"Recent Alerts:\n{alerts}")
        
    return "\n\n".join(context_parts)

def asset_network_node(state: GraphState) -> dict:

    query = state.get("query", "")
    
    extraction = _extract_intent_and_asset(query)
    asset_id = extraction.get("asset_id", "Unknown")
    intent = extraction.get("intent", "general_info")
    
    context = _gather_network_context(asset_id, intent)
    
    synthesis_prompt = SYNTHESIS_PROMPT.format(
        intent=intent,
        query=query,
        asset_id=asset_id,
        context=context
    )
    
    try:
        final_response = llm.invoke(synthesis_prompt)
        response_text = clean_response(getattr(final_response, "content", str(final_response)))
        
        confidence = compute_confidence(
            agent_name="NetworkAgent",
            response_text=response_text,
            retrieved_context={"asset_id": asset_id, "intent": intent, "context": context},
        )
        
        return {
            "current_agent": "NetworkAgent",
            "retrieved_context": {"asset_id": asset_id, "intent": intent, "context": context},
            "response": response_text,
            "confidence": confidence,
            "messages": [final_response]
        }
    except Exception as e:
        return {
            "current_agent": "NetworkAgent",
            "response": f"Failed to generate response: {str(e)}",
            "confidence": 0.10,
            "messages": []
        }

def create_agent():
    workflow = StateGraph(GraphState)
    workflow.add_node("NetworkAgent", asset_network_node)
    workflow.add_edge(START, "NetworkAgent")
    workflow.add_edge("NetworkAgent", END)
    return workflow.compile()
