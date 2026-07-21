"""
Core LLM initialization module for the INDRA LangGraph prototype.
"""

import os
import re

from dotenv import load_dotenv
from langchain_groq import ChatGroq

# Load .env
load_dotenv()


class LLMWithFallbackWrapper:
    """
    Wrapper for LangChain ChatGroq that implements automatic fallback routing
    for both standard LLM invocations and structured schema outputs.
    Catches rate limit (429) errors and shifts to backup models dynamically.
    """
    def __init__(self, primary, fallbacks):
        self.primary = primary
        self.fallbacks = fallbacks
        self.runnable = primary.with_fallbacks(fallbacks)

    def invoke(self, *args, **kwargs):
        return self.runnable.invoke(*args, **kwargs)

    def stream(self, *args, **kwargs):
        return self.runnable.stream(*args, **kwargs)

    def with_structured_output(self, schema, *args, **kwargs):
        # Generate structured outputs for both primary and backup chains
        structured_primary = self.primary.with_structured_output(schema, *args, **kwargs)
        structured_fallbacks = [fb.with_structured_output(schema, *args, **kwargs) for fb in self.fallbacks]
        return structured_primary.with_fallbacks(structured_fallbacks)


def _initialize_shared_llm():
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise ValueError(
            "CRITICAL: GROQ_API_KEY not found in environment variables."
        )

    # Initialize primary and backup ChatGroq instances
    primary = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0,
        api_key=api_key,
    )
    
    fallback_1 = ChatGroq(
        model="qwen-2.5-32b",
        temperature=0,
        api_key=api_key,
    )
    
    fallback_2 = ChatGroq(
        model="mixtral-8x7b-32768",
        temperature=0,
        api_key=api_key,
    )
    
    fallback_3 = ChatGroq(
        model="llama-3-8b-8192",
        temperature=0,
        api_key=api_key,
    )

    return LLMWithFallbackWrapper(primary, [fallback_1, fallback_2, fallback_3])


llm = _initialize_shared_llm()

def clean_response(text: str) -> str:
    """Removes <think>...</think> reasoning blocks from the response."""
    if not isinstance(text, str):
        return text
    return re.sub(r"<think>.*?</think>\n*", "", text, flags=re.DOTALL).strip()