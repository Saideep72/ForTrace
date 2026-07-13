from agents.query.tools import search_vector, search_sql, search_graph

def gather_search_context(query: str) -> dict:
    """
    Calls vector, SQL, and graph search tools and merges the results into a single context dictionary.
    """
    vector_results = search_vector(query)
    sql_results = search_sql(query)
    graph_results = search_graph(query)
    
    return {
        "vector_search": vector_results,
        "sql_search": sql_results,
        "graph_search": graph_results
    }
