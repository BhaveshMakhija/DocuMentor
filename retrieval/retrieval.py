import os
import json
from langchain.retrievers import EnsembleRetriever
from indexing.indexing import ElasticsearchBM25, FaissVectorStore

def load_config():
    """
    Load project configuration from config.json.
    """
    p = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config', 'config.json')
    if os.path.exists(p):
        with open(p, 'r') as f: return json.load(f)
    return {}

def hybrid_search():
    """
    Performs a hybrid search combining BM25 keyword search (on Elasticsearch)
    and semantic vector search (on FAISS).
    
    Returns:
        The combined EnsembleRetriever object.
    """
    cfg = load_config()
    k = cfg.get("top_k_retrieval", 10)
    
    kr = ElasticsearchBM25().as_retriever(top_k=k)
    vr = FaissVectorStore().as_retriever(top_k=k)
    
    if not vr: 
        raise ValueError("FAISS index not found. Ingest documents first.")
        
    if kr: 
        try:
            # Create an ensemble retriever that merges both sets of results
            return EnsembleRetriever(retrievers=[kr, vr], weights=[0.5, 0.5])
        except Exception: 
            return vr
            
    return vr
