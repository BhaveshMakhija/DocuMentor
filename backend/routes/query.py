from fastapi import APIRouter
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from backend.models.request_models import QueryRequest, QueryResponse, CitationModel
from backend.services.generation_service import generate_answer

router = APIRouter()

@router.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    try:
        answer, citations = generate_answer(request.query)
        
        cit_models = []
        for c in citations:
            cit_models.append(CitationModel(
                doc_id=c.get("doc_id", "Unknown"),
                source=c.get("source", "Unknown"),
                content=c.get("content", ""),
                score=c.get("score")
            ))
            
        return QueryResponse(answer=answer, citations=cit_models)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return QueryResponse(answer=f"Error processing query: {str(e)}", citations=[])
