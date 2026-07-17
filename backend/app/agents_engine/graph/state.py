"""
State definition for the INDRA LangGraph prototype.
"""

from typing import Annotated, List, Optional, TypedDict
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class GraphState(TypedDict):
    """
    Represents the state of the graph during execution for the Hackathon MVP.
    Contains only the minimal fields necessary for the prototype.
    """
    
    # The user's original natural language input
    query: str
    
    # The classified intent of the query (e.g., 'RCA', 'Predictive', 'Query')
    intent: Optional[str]
    
    # Context chunks retrieved from Vector, Graph, or SQL databases
    retrieved_context: dict
    
    # The name of the specialized agent currently handling the request
    current_agent: Optional[str]
    
    # The final natural language response to be returned to the user
    response: Optional[str]
    
    # Self-assessed confidence score from the agent (0.0 – 1.0)
    confidence: Optional[float]
    
    # Toggle switch to include expert retiring engineer notes in RAG search context
    include_expert_advice: Optional[bool]
    
    # The conversation history and intermediate tool messages.
    # `add_messages` ensures new messages are appended rather than overwritten.
    messages: Annotated[List[BaseMessage], add_messages]

