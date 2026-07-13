"""
Query Agent implementation for the INDRA LangGraph prototype MVP.
"""

import json
from typing import Any, Dict
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, START, END

from graph.state import GraphState
from core.llm import llm, clean_response
from core.retrieval import gather_search_context
from core.confidence import compute_confidence


def agent_node(state: GraphState) -> Dict[str, Any]:
    """
    Executes the query agent logic: retrieves context and generates an answer.
    
    Args:
        state (GraphState): The current state of the graph.
        
    Returns:
        Dict[str, Any]: A dictionary containing the updated fields for the GraphState.
    """
    # 1. Read State
    # Extract the original user query from the incoming state
    query = state.get("query", "")
    
    # 2. Retrieve Context
    retrieved_context = gather_search_context(query)
    
    # 3. Call LLM
    # Prepare the context and instructions for the LLM
    system_msg = SystemMessage(
        content=(
            "You are a helpful industrial assistant. Answer the user's query concisely "
            "based ONLY on the provided context. Do not invent information."
        )
    )
    human_msg = HumanMessage(
        content=(
            f"Context: {json.dumps(retrieved_context)}\n\n"
            f"User Query: {query}"
        )
    )
    
    # Send the context and original user query to the shared LLM to generate a concise answer
    try:
        response_msg = llm.invoke([system_msg, human_msg])
        response_msg.content = clean_response(response_msg.content)
        
        confidence = compute_confidence(
            agent_name="QueryAgent",
            response_text=response_msg.content,
            retrieved_context=retrieved_context,
        )
        
        return {
            "current_agent": "QueryAgent",
            "retrieved_context": retrieved_context,
            "response": response_msg.content,
            "confidence": confidence,
            "messages": [response_msg]
        }
    except Exception as e:
        return {
            "current_agent": "QueryAgent",
            "retrieved_context": retrieved_context,
            "response": f"Error generating response: {str(e)}",
            "confidence": 0.10,
            "messages": []
        }


def create_agent():
    """
    Builds and compiles the simple LangGraph for the Query Agent.
    
    Returns:
        CompiledStateGraph: The compiled runnable graph.
    """
    # Initialize the state graph with our defined state schema
    workflow = StateGraph(GraphState)
    
    # Add the single node for our query logic
    workflow.add_node("query_node", agent_node)
    
    # Set up the simple linear workflow: START -> query_node -> END
    workflow.add_edge(START, "query_node")
    workflow.add_edge("query_node", END)
    
    # Compile and return the executable graph
    return workflow.compile()
