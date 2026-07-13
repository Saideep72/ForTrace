"""
Graph Builder for the INDRA prototype MVP.

Centralizes the assembly and compilation of the LangGraph workflow.
"""

from langgraph.graph import StateGraph, START, END

from graph.state import GraphState
from agents.supervisor.agent import agent_node as supervisor_node
from agents.query.agent import agent_node as query_node
from agents.rca.agent import agent_node as rca_node
from agents.predictive_maintenance.agent import agent_node as predictive_node
from agents.asset_network.agent import asset_network_node as network_node
from agents.out_of_scope.agent import out_of_scope_node

def route_from_supervisor(state: GraphState) -> str:
    """
    Reads the supervisor's decision and routes to the appropriate agent.
    """
    intent = state.get("intent")
    
    if intent == "QueryAgent":
        return "QueryAgent"
        
    if intent == "RCAAgent":
        return "RCAAgent"
        
    if intent == "PredictiveAgent":
        return "PredictiveAgent"
        
    if intent == "NetworkAgent":
        return "NetworkAgent"

    if intent == "OutOfScopeAgent":
        return "OutOfScopeAgent"
    
    return END


def build_graph():
    """
    Assembles and compiles the complete LangGraph workflow.
    
    Returns:
        CompiledGraph: The executable LangGraph application.
    """
    workflow = StateGraph(GraphState)
    
    # 1. Add Nodes
    workflow.add_node("Supervisor", supervisor_node)
    workflow.add_node("QueryAgent", query_node)
    workflow.add_node("RCAAgent", rca_node)
    workflow.add_node("PredictiveAgent", predictive_node)
    workflow.add_node("NetworkAgent", network_node)
    workflow.add_node("OutOfScopeAgent", out_of_scope_node)
    
    # 2. Define Workflow Edges
    workflow.add_edge(START, "Supervisor")
    
    workflow.add_conditional_edges(
        "Supervisor",
        route_from_supervisor,
        {
            "QueryAgent": "QueryAgent",
            "RCAAgent": "RCAAgent",
            "PredictiveAgent": "PredictiveAgent",
            "NetworkAgent": "NetworkAgent",
            "OutOfScopeAgent": "OutOfScopeAgent",
            END: END
        }
    )
    
    workflow.add_edge("QueryAgent", END)
    workflow.add_edge("RCAAgent", END)
    workflow.add_edge("PredictiveAgent", END)
    workflow.add_edge("NetworkAgent", END)
    workflow.add_edge("OutOfScopeAgent", END)
    
    # 3. Compile Graph
    return workflow.compile()
