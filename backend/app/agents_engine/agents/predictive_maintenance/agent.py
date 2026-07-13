import json
from typing import Any, Dict
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, START, END

from graph.state import GraphState
from core.llm import llm, clean_response
from core.confidence import compute_confidence
from agents.predictive_maintenance.tools import (
    get_asset_information,
    get_sensor_summary,
    get_maintenance_history
)


def agent_node(state: GraphState) -> Dict[str, Any]:
    """
    Executes the Predictive Maintenance agent logic: retrieves context and generates a prediction.
    
    Args:
        state (GraphState): The current state of the graph.
        
    Returns:
        Dict[str, Any]: A dictionary containing the updated fields for the GraphState.
    """
    # 1. Read State
    query = state.get("query", "")
    
    # 2. Retrieve Context
    asset_info = get_asset_information(query)
    sensor_summary = get_sensor_summary(query)
    maintenance_history = get_maintenance_history(query)
    
    retrieved_context = {
        "asset_information": asset_info,
        "sensor_summary": sensor_summary,
        "maintenance_history": maintenance_history
    }
    
    # 3. Call LLM
    system_msg = SystemMessage(
        content=(
            "You are an expert industrial Predictive Maintenance assistant. "
            "Analyze the asset information, sensor summary, and maintenance history. "
            "Predict the health of the equipment, identify potential upcoming failures, "
            "and suggest preventive maintenance actions based ONLY on the provided context. "
            "Do not invent information."
        )
    )
    human_msg = HumanMessage(
        content=(
            f"Context: {json.dumps(retrieved_context)}\n\n"
            f"User Query: {query}"
        )
    )
    
    try:
        response_msg = llm.invoke([system_msg, human_msg])
        response_msg.content = clean_response(response_msg.content)
        
        confidence = compute_confidence(
            agent_name="PredictiveAgent",
            response_text=response_msg.content,
            retrieved_context=retrieved_context,
        )
        
        return {
            "current_agent": "PredictiveAgent",
            "retrieved_context": retrieved_context,
            "response": response_msg.content,
            "confidence": confidence,
            "prediction": response_msg.content,
            "messages": [response_msg]
        }
    except Exception as e:
        return {
            "current_agent": "PredictiveAgent",
            "retrieved_context": retrieved_context,
            "response": f"Error generating predictive maintenance: {str(e)}",
            "confidence": 0.10,
            "messages": []
        }


def create_agent():
    """
    Builds and compiles the simple LangGraph for the Predictive Maintenance Agent.
    
    Returns:
        CompiledStateGraph: The compiled runnable graph.
    """
    workflow = StateGraph(GraphState)
    
    workflow.add_node("predictive_node", agent_node)
    
    workflow.add_edge(START, "predictive_node")
    workflow.add_edge("predictive_node", END)
    
    return workflow.compile()
