from fastapi import APIRouter
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.assets import router as assets_router
from app.api.v1.endpoints.query import router as query_router
from app.api.v1.endpoints.documents import router as documents_router
from app.api.v1.endpoints.extraction import router as extraction_router
from app.api.v1.endpoints.search import router as search_router
from app.api.v1.endpoints.entities import router as entities_router
from app.api.v1.endpoints.graph import router as graph_router
from app.api.v1.endpoints.reports import router as reports_router

# Core version 1 router
api_router = APIRouter()

# Include the authentication router under /auth prefix
api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)

# Include the asset management router under /assets prefix
api_router.include_router(
    assets_router,
    prefix="/assets",
    tags=["Asset Management"]
)

# Include the query agent router under /query prefix
api_router.include_router(
    query_router,
    prefix="/query",
    tags=["Query Agent"]
)

# Include the documents management router under /documents prefix
api_router.include_router(
    documents_router,
    prefix="/documents",
    tags=["Document Management"]
)

# Include the document processing extraction router under /documents prefix
api_router.include_router(
    extraction_router,
    prefix="/documents",
    tags=["Document Processing"]
)

# Include the semantic similarity search router under /search prefix
api_router.include_router(
    search_router,
    prefix="/search",
    tags=["Semantic Search"]
)

# Include the entities lookup router under /entities prefix
api_router.include_router(
    entities_router,
    prefix="/entities",
    tags=["Named Entity Recognition (NER)"]
)

# Include the graph topology router under /graph prefix
api_router.include_router(
    graph_router,
    prefix="/graph",
    tags=["Graph Topology"]
)

# Include the reports and audit router under /reports prefix
api_router.include_router(
    reports_router,
    prefix="/reports",
    tags=["Reports & Audit Trail"]
)



