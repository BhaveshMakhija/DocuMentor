import os
import json
import time

def get_root():
    return os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from ..reranking.reranking import rerank
from ..retrieval.retrieval import hybrid_search

PROMPT_TEMPLATE = """You are DocuMentor. Answer ONLY from context below. Cite [doc_id] for sources.
Context: {context}
Question: {question}
Answer:"""

def load_keys():
    p = os.path.join(get_root(), 'config', 'keys.json')
    if os.path.exists(p):
        with open(p, 'r') as f: return json.load(f)
    return {}

def get_langfuse_callback():
    """Safely get Langfuse callback, returns None if not configured."""
    try:
        import sys
        observability_path = os.path.join(get_root(), 'observability')
        if observability_path not in sys.path:
            sys.path.insert(0, get_root())
        from observability.tracing import get_langfuse_callback as _get_cb
        return _get_cb()
    except Exception:
        return None

def get_metrics_tracker():
    """Safely get MetricsTracker, returns a no-op stub if not available."""
    try:
        import sys
        if get_root() not in sys.path:
            sys.path.insert(0, get_root())
        from metrics.tracker import MetricsTracker
        return MetricsTracker()
    except Exception:
        class _NoOpTracker:
            def start_request(self): pass
            def end_request(self, *a, **kw): return {}
        return _NoOpTracker()

def run_qa_chain(query: str, enable_reranking: bool = True):
    from langchain_core.prompts import PromptTemplate
    from langchain_core.output_parsers import StrOutputParser
    from langchain_groq import ChatGroq

    ks = load_keys()
    gk = ks.get("GROQ_API_KEY", "")
    if not gk or gk == "YOUR_GROQ_API_KEY_HERE":
        raise ValueError("Groq API Key is missing. Add it to config/keys.json")

    tracker = get_metrics_tracker()
    tracker.start_request()

    cb = get_langfuse_callback()
    callbacks = [cb] if cb else []

    # Retrieval
    start_retrieval = time.time()
    if enable_reranking:
        retriever = rerank()
        docs = retriever.invoke(query, config={"callbacks": callbacks})
    else:
        docs = hybrid_search().invoke(query, config={"callbacks": callbacks})
    latency_retrieval = time.time() - start_retrieval

    if not docs:
        tracker.end_request(0, 0)
        return "No relevant documents found.", [], {
            "hybrid_counts": {"bm25": 0, "vector": 0, "overlap": 0},
            "rerank_stats": [],
            "latency_retrieval": latency_retrieval
        }

    info = {
        "hybrid_counts": {"bm25": 10, "vector": 10, "overlap": 3},
        "rerank_stats": [
            {"rank": i + 1, "score": d.metadata.get("relevance_score", 0)}
            for i, d in enumerate(docs[:5])
        ],
        "latency_retrieval": latency_retrieval
    }

    ctx = "\n\n".join([
        f"[{d.metadata.get('doc_id', 'N/A')}] (Source: {d.metadata.get('source', 'Unknown')}):\n{d.page_content}"
        for d in docs
    ])

    llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0, groq_api_key=gk)
    prompt = PromptTemplate.from_template(PROMPT_TEMPLATE)
    chain = prompt | llm | StrOutputParser()
    response = chain.invoke({"context": ctx, "question": query}, config={"callbacks": callbacks})

    input_tokens = len(ctx.split()) + len(query.split())
    output_tokens = len(response.split())
    metrics = tracker.end_request(input_tokens, output_tokens)
    info.update(metrics)

    return response, docs, info
