from typing import List, Dict, Any

def search_sql(query: str) -> List[Dict[str, Any]]:
    """
    Placeholder function for SQL search.
    """
    return [{"source": "sql_search", "result": f"Mocked SQL data for: {query}"}]

def search_vector(query: str) -> List[Dict[str, Any]]:
    """
    Placeholder function for Vector search.
    """
    return [{"source": "vector_search", "result": f"Mocked vector data for: {query}"}]

def search_graph(query: str) -> List[Dict[str, Any]]:
    """
    Placeholder function for Graph search.
    """
    return [{"source": "graph_search", "result": f"Mocked graph data for: {query}"}]
