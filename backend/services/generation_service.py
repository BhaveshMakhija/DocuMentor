import sys
import os
from typing import Tuple, List
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path: sys.path.append(PROJECT_ROOT)
from generation.generation import run_qa_chain
def generate_answer(query: str) -> Tuple[str, List[dict], dict]:
    a, ds, info = run_qa_chain(query)
    cs = [{"doc_id": d.metadata.get("doc_id", "Unknown"), "source": d.metadata.get("source", "Unknown"), "content": d.page_content, "score": d.metadata.get("relevance_score", None)} for d in ds]
    return a, cs, info
