import sys
import os
import time
from typing import Tuple, List

# Ensure project root is in path for imports
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from api.core import run_qa_chain
from api.core.rag_logging.rag_logger import log_query

def generate_answer(query: str) -> Tuple[str, List[dict], dict]:
    """
    Pipeline wrapper that generates an answer, measures latency, and logs the interaction.
    
    Args:
        query: User query string.
        
    Returns:
        Tuple containing the answer (str), citations (list of dicts), and process info (dict).
    """
    start_time = time.time()
    
    # 1. Execute RAG Chain
    answer, docs, info = run_qa_chain(query)
    
    # 2. Calculate Latency (ms)
    latency_ms = (time.time() - start_time) * 1000
    
    # 3. Format Citations for return
    citations = [
        {
            "doc_id": d.metadata.get("doc_id", "Unknown"),
            "source": d.metadata.get("source", "Unknown"),
            "content": d.page_content,
            "score": d.metadata.get("relevance_score", None)
        } for d in docs
    ]
    
    # 4. Extract retrieved snippets for logging
    retrieved_snippets = [d.page_content[:200] + "..." for d in docs]
    
    # 5. Log for Observability
    log_query(
        query=query,
        retrieved_docs=retrieved_snippets,
        answer=answer,
        latency_ms=round(latency_ms, 2)
    )
    
    # Enrich info with latency for the UI if needed
    info["latency_ms"] = round(latency_ms, 2)
    
    return answer, citations, info
