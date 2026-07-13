import sys
import os

# Add agents path to sys.path
AGENTS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "app/agents_engine"))
if AGENTS_PATH not in sys.path:
    sys.path.append(AGENTS_PATH)

from dotenv import load_dotenv
load_dotenv()

from graph.builder import build_graph

print("Compiling agent graph...")
graph = build_graph()

print("Invoking agent query: 'Explain the network dependencies of Reactor R-101'...")
try:
    result = graph.invoke({
        "query": "Explain the network dependencies of Reactor R-101",
        "messages": [],
        "retrieved_context": {}
    })

    print("\n=== Agent Response ===")
    print(result.get("response"))
    print("\nAgent Used:", result.get("current_agent"))
    print("Intent Resolved:", result.get("intent"))
except Exception as e:
    print(f"Error executing agent: {e}")
