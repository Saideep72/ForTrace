"""
Out-of-Scope Agent.

This agent handles queries that are outside the domain of plant operations,
industrial equipment diagnostics, and facility management.

Instead of crashing or returning an unhelpful error, it returns a polite,
informative message explaining what FortTrace can and cannot answer.
"""

from graph.state import GraphState


# Capability list shown to the user when their question is out of scope
SCOPE_DESCRIPTION = """FortTrace is an industrial plant intelligence assistant. I can help you with:

  • Asset & equipment status — e.g. "What is the current status of Pump P-101?"
  • Network & dependency mapping — e.g. "What assets are connected to Reactor R-101?"
  • Root cause analysis — e.g. "Why is Heat Exchanger E-201 showing high pressure?"
  • Predictive maintenance — e.g. "Predict the health of Turbine TR-101 in the next 30 days."
  • Document retrieval — e.g. "Find the SOP for Boiler B-101 startup procedure."
  • Active alarms & alerts — e.g. "Are there any active warnings on the coolant loop?"

Your question appears to be outside my area of expertise. Please rephrase your query \
to focus on plant equipment, operational procedures, safety standards, \
or asset interdependencies."""


def out_of_scope_node(state: GraphState) -> dict:
    """
    Graceful fallback node for queries that do not relate to plant operations.

    Returns a polite, scoped explanation of what FortTrace can answer
    instead of crashing or returning a generic LLM error.
    """
    query = state.get("query", "")

    response = (
        f"I'm sorry, I couldn't find a relevant answer for: \"{query}\"\n\n"
        + SCOPE_DESCRIPTION
    )

    return {
        "current_agent": "OutOfScopeAgent",
        "retrieved_context": {},
        "response": response,
        "confidence": 0.10,
        "messages": [],
    }
