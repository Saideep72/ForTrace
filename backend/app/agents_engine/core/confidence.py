"""
Confidence scoring utility for ForTrace agents.

Each agent calls ``compute_confidence()`` with the signals available to it
and gets back a float in [0.0, 1.0] that reflects how well-grounded the
response actually is.

Scoring logic (additive, capped at 1.0):
  Base score per agent type   (always present)
  + vector hit bonus          (real RAG chunks found, not mock)
  + sql / graph hit bonus     (structured DB data found)
  + network context bonus     (live asset details retrieved)
  - penalty if response text signals uncertainty / error
"""

from __future__ import annotations

import re
from typing import Any, Dict, Optional


# ---------------------------------------------------------------------------
# Low-confidence signal patterns in the response text
# ---------------------------------------------------------------------------
_UNCERTAINTY_PATTERNS = re.compile(
    r"\b("
    r"cannot be determined|not available|no information|unknown|"
    r"mocked|mock data|placeholder|error generating|failed to|"
    r"i don'?t know|i am not sure|unable to|no data|"
    r"consult official|check with manufacturer"
    r")\b",
    re.IGNORECASE,
)

# Patterns that signal a rich, grounded answer
_CONFIDENCE_SIGNALS = re.compile(
    r"\b("
    r"according to|based on|the document|the sop|procedure states|"
    r"upstream|downstream|connected to|asset details|"
    r"temperature|pressure|flow rate|alarm|alert|maintenance|"
    r"root cause|corrective action|predicted|health score"
    r")\b",
    re.IGNORECASE,
)


def compute_confidence(
    *,
    agent_name: str,
    response_text: str,
    retrieved_context: Optional[Dict[str, Any]] = None,
) -> float:
    """
    Compute a heuristic confidence score for an agent response.

    Args:
        agent_name:        The agent that produced the response (e.g. "QueryAgent").
        response_text:     The final answer text.
        retrieved_context: The context dict returned by the retrieval layer
                           (keys: vector_search, sql_search, graph_search, etc.)

    Returns:
        float in [0.0, 1.0]
    """
    ctx = retrieved_context or {}

    # ------------------------------------------------------------------
    # 1. Base score — differs by agent specialisation
    # ------------------------------------------------------------------
    BASE_SCORES: Dict[str, float] = {
        "QueryAgent":       0.55,
        "RCAAgent":         0.60,
        "PredictiveAgent":  0.60,
        "NetworkAgent":     0.65,
        "OutOfScopeAgent":  0.10,   # Not really a "confident" answer
    }
    score = BASE_SCORES.get(agent_name, 0.50)

    # ------------------------------------------------------------------
    # 2. Vector search bonus — real chunks, not mock placeholders
    # ------------------------------------------------------------------
    vector_result = ctx.get("vector_search", "")
    if isinstance(vector_result, (list, dict)) and vector_result:
        score += 0.12          # actual structured results
    elif isinstance(vector_result, str):
        if "Mocked" not in vector_result and len(vector_result) > 30:
            score += 0.08      # real string result
        elif "Mocked" in vector_result:
            score -= 0.05      # mock penalty

    # ------------------------------------------------------------------
    # 3. SQL / graph bonus — structured DB data present
    # ------------------------------------------------------------------
    sql_result = ctx.get("sql_search", "")
    if isinstance(sql_result, (list, dict)) and sql_result:
        score += 0.08
    elif isinstance(sql_result, str) and "Mocked" not in sql_result and len(sql_result) > 10:
        score += 0.05

    graph_result = ctx.get("graph_search", "")
    if isinstance(graph_result, (list, dict)) and graph_result:
        score += 0.06
    elif isinstance(graph_result, str) and "Mocked" not in graph_result and len(graph_result) > 10:
        score += 0.04

    # ------------------------------------------------------------------
    # 4. Network-specific context (asset details, connections, alerts)
    # ------------------------------------------------------------------
    if "asset_id" in ctx and ctx.get("asset_id", "Unknown") != "Unknown":
        score += 0.05
    if "context" in ctx and isinstance(ctx["context"], str) and len(ctx["context"]) > 100:
        score += 0.05

    # ------------------------------------------------------------------
    # 5. Response text quality signals
    # ------------------------------------------------------------------
    uncertainty_hits = len(_UNCERTAINTY_PATTERNS.findall(response_text))
    confidence_hits  = len(_CONFIDENCE_SIGNALS.findall(response_text))

    score -= uncertainty_hits * 0.06
    score += confidence_hits  * 0.02

    # ------------------------------------------------------------------
    # 6. Response length bonus (very short = likely a failure/fallback)
    # ------------------------------------------------------------------
    resp_len = len(response_text.strip())
    if resp_len > 300:
        score += 0.04
    elif resp_len < 50:
        score -= 0.10

    # Clamp to valid range
    return round(max(0.05, min(1.0, score)), 2)
