from pydantic import BaseModel
from typing import List, Optional
class QueryRequest(BaseModel): query: str
class CitationModel(BaseModel): doc_id: str; source: str; content: str; score: Optional[float] = None
class QueryResponse(BaseModel): answer: str; citations: List[CitationModel]
