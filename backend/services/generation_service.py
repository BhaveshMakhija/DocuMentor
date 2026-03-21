import sys
import os
from typing import Tuple, List

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from generation.generation import run_qa_chain

def generate_answer(query: str) -> Tuple[str, List[dict]]:
    answer, docs = run_qa_chain(query)
    
    citations = []
    for doc in docs:
        citations.append({
            "doc_id": doc.metadata.get("doc_id", "Unknown"),
            "source": doc.metadata.get("source", "Unknown"),
            "content": doc.page_content,
            "score": doc.metadata.get("relevance_score", None)
        })
        
    return answer, citations
