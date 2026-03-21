import os
import json
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder
from retrieval.retrieval import hybrid_search

def load_keys():
    keys_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config', 'keys.json')
    if os.path.exists(keys_path):
        with open(keys_path, 'r') as f:
            return json.load(f)
    return {}
    
def load_config():
    config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config', 'config.json')
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            return json.load(f)
    return {}

def rerank():
    """
    Returns ContextualCompressionRetriever bridging Cohere/Local Rankers.
    """
    base_retriever = hybrid_search()
    keys = load_keys()
    config = load_config()
    top_n = config.get("top_k_reranking", 5)
    
    cohere_key = keys.get("COHERE_API_KEY", "")
    if cohere_key and cohere_key != "YOUR_COHERE_API_KEY_HERE":
        try:
            from langchain.retrievers.document_compressors import CohereRerank
            compressor = CohereRerank(
                cohere_api_key=cohere_key, 
                model="rerank-english-v3.0", 
                top_n=top_n
            )
            return ContextualCompressionRetriever(
                base_compressor=compressor,
                base_retriever=base_retriever
            )
        except Exception:
            pass
            
    # Fallback to local
    model = HuggingFaceCrossEncoder(model_name="cross-encoder/ms-marco-MiniLM-L-6-v2")
    compressor = CrossEncoderReranker(model=model, top_n=top_n)
    
    return ContextualCompressionRetriever(
        base_compressor=compressor,
        base_retriever=base_retriever
    )
