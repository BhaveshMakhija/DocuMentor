from fastapi import APIRouter
from backend.models.request_models import QueryRequest, QueryResponse
from backend.services.generation_service import generate_answer

router = APIRouter()

@router.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """
    Endpoint to handle RAG queries.
    1. Pass question to retrieval service.
    2. Pass results to reranking service.
    3. Pass context + question to generation service.
    4. Return the answer string and list of citations.
    """
    # answer, citations = generate_answer(request.query)
    # return QueryResponse(answer=answer, citations=citations)
    return QueryResponse(answer="This is a placeholder answer.", citations=[])
