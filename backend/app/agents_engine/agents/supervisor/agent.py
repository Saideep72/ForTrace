import re
from typing import Literal
from pydantic import BaseModel
from langchain_core.messages import SystemMessage

from graph.state import GraphState
from core.llm import llm


# ---------------------------------------------------------------------------
# Out-of-scope keyword filter
# ---------------------------------------------------------------------------
# These patterns indicate questions that are clearly unrelated to plant
# operations. If matched, we skip the LLM router entirely and route straight
# to OutOfScopeAgent to save API calls and avoid hallucinated answers.
_OUT_OF_SCOPE_PATTERNS = re.compile(
    r"\b("
    # Personal safety / lifestyle
    r"how (can|do|should) (i|we|you) (be safe|stay safe|stay healthy|lose weight|get fit)|"
    r"what (should|can) (i|we) eat|recipe|cook|"
    # Geography / general knowledge
    r"capital (city|of)|what is the (population|currency|flag|weather|time) (of|in)|"
    r"who (is|was) (the )?(president|prime minister|king|queen|ceo)|"
    # Greetings / small talk
    r"^(hi|hello|hey|good morning|good evening|how are you|whats up|what'?s up)[^a-z]*$|"
    # Tech / programming unrelated to plant systems
    r"how (do i|to) (code|program|write|build) (a |an )?(website|app|game|python script)|"
    # Finance / stocks
    r"stock price|cryptocurrency|bitcoin|market cap|invest(ment|ing)|"
    # Entertainment
    r"movie|film|song|music|sports|football|cricket|chess|"
    # Generic personal questions
    r"name of (the )?(factory|company|owner|founder|country)"
    r")\b",
    re.IGNORECASE
)


class Route(BaseModel):
    next_agent: Literal[
        "QueryAgent",
        "RCAAgent",
        "PredictiveAgent",
        "NetworkAgent",
        "OutOfScopeAgent",
    ]


def agent_node(state: GraphState) -> dict:
    """
    Supervisor router node.

    1. Fast-path: checks the query against an out-of-scope keyword filter.
       If matched, immediately routes to OutOfScopeAgent without an LLM call.
    2. LLM-path: uses structured-output routing for all other queries.
       Falls back to QueryAgent if the LLM call fails.

    Args:
        state (GraphState): The current graph state.

    Returns:
        dict: Updated state with ``intent`` and ``current_agent`` set.
    """
    query = state.get("query", "")

    # 1. Fast out-of-scope pre-filter
    if _OUT_OF_SCOPE_PATTERNS.search(query):
        return {"intent": "OutOfScopeAgent", "current_agent": "Supervisor"}

    # 2. LLM-based routing for plant-domain queries
    system_prompt = (
        "You are a router for an industrial plant AI assistant. "
        "Route the user query to exactly one agent:\n"
        "- QueryAgent: general informational questions about equipment, SOPs, regulations, or documents\n"
        "- RCAAgent: root cause analysis — 'why is X failing / tripping / overheating'\n"
        "- PredictiveAgent: predictive maintenance — 'predict health / remaining life of X'\n"
        "- NetworkAgent: asset network and dependencies — 'connections / upstream / downstream of X'\n"
        "- OutOfScopeAgent: the question is NOT related to plant operations, industrial equipment, "
        "safety standards, or facility management at all\n\n"
        "Respond with a single JSON object: {\"next_agent\": \"<AgentName>\"}"
    )
    router = llm.with_structured_output(Route)
    try:
        decision = router.invoke([SystemMessage(content=system_prompt), ("human", query)])
        intent = decision.next_agent
    except Exception:
        # Safe fallback — QueryAgent can handle most plant questions gracefully
        intent = "QueryAgent"

    return {"intent": intent, "current_agent": "Supervisor"}

