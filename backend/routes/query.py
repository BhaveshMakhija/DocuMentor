from fastapi import APIRouter
import sys
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path: sys.path.append(PROJECT_ROOT)

from backend.models.request_models import QueryRequest, QueryResponse, CitationModel
from backend.services.generation_service import generate_answer

router = APIRouter()

@router.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    try:
        answer, citations, info = generate_answer(request.query)
        cit_models = [CitationModel(
            doc_id=c.get("doc_id", "Unknown"),
            source=c.get("source", "Unknown"),
            content=c.get("content", ""),
            score=c.get("score")
        ) for c in citations]
        # Wrap process info if it exists
        from backend.models.request_models import RAGProcessInfo
        proc = RAGProcessInfo(**info) if info else None
        return QueryResponse(answer=answer, citations=cit_models, process_info=proc)
    except Exception as e:
        return QueryResponse(answer=f"Error processing: {str(e)}", citations=[], process_info=None)
