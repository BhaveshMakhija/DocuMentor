import os
import json
from langchain.retrievers import EnsembleRetriever
from indexing.indexing import ElasticsearchBM25, FaissVectorStore

def load_config():
    p = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config', 'config.json')
    if os.path.exists(p):
        with open(p, 'r') as f: return json.load(f)
    return {}

def hybrid_search():
    cfg = load_config(); k = cfg.get("top_k_retrieval", 10)
    kr = ElasticsearchBM25().as_retriever(top_k=k); vr = FaissVectorStore().as_retriever(top_k=k)
    if not vr: raise ValueError("FAISS not found.")
    return EnsembleRetriever(retrievers=[kr, vr], weights=[0.5, 0.5])
