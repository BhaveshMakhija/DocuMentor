import os
import json
from langchain.retrievers import EnsembleRetriever
from indexing.indexing import ElasticsearchBM25, FaissVectorStore

def load_config():
    config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config', 'config.json')
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            return json.load(f)
    return {}

def hybrid_search():
    """
    Returns an EnsembleRetriever combining BM25 and Vector search logic
    mapped statically over weights.
    """
    config = load_config()
    top_k = config.get("top_k_retrieval", 10)
    
    keyword_retriever = ElasticsearchBM25().as_retriever(top_k=top_k)
    vector_retriever = FaissVectorStore().as_retriever(top_k=top_k)
    
    if not vector_retriever:
        raise ValueError("FAISS index not initialized. Please load documents first.")
        
    return EnsembleRetriever(
        retrievers=[keyword_retriever, vector_retriever],
        weights=[0.5, 0.5]
    )
