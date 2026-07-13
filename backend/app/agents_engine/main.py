"""
Entry point for testing the INDRA LangGraph prototype.
"""

from graph.builder import build_graph


def main():
    # Build the compiled LangGraph
    app = build_graph()

    # Initial state
    initial_state = {
        "query": "What is predictive maintenance?",
        "intent": None,
        "retrieved_context": {},
        "current_agent": None,
        "response": None,
        "messages": []
    }

    # Execute the graph
    result = app.invoke(initial_state)

    print("\n========== FINAL STATE ==========\n")

    print("Intent:")
    print(result["intent"])

    print("\nCurrent Agent:")
    print(result["current_agent"])

    print("\nResponse:")
    print(result["response"])

    print("\n=================================")


if __name__ == "__main__":
    main()