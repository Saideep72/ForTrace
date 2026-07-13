from langchain_core.tools import tool

# TODO: Define agent-specific tools here

@tool
def sample_tool(query: str) -> str:
    """
    A sample tool stub.
    
    Args:
        query (str): The input query.
        
    Returns:
        str: The tool output.
    """
    # TODO: Implement tool logic
    pass
