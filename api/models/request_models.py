from pydantic import BaseModel
from typing import List, Optional
class QueryRequest(BaseModel): query: str
class RAGProcessInfo(BaseModel):
    hybrid_counts: dict = {"bm25": 0, "vector": 0, "overlap": 0}
    rerank_stats: List[dict] = []
    generation_model: str = "llama-3.1-8b-instant"

class CitationModel(BaseModel): 
    doc_id: str; source: str; content: str; score: Optional[float] = None

class QueryResponse(BaseModel): 
    answer: str; 
    citations: List[CitationModel]; 
    process_info: Optional[RAGProcessInfo] = None
