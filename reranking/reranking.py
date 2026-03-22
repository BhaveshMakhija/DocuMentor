import os
import json
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder
from retrieval.retrieval import hybrid_search

def load_keys():
    """
    Load API keys from keys.json.
    """
    p = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config', 'keys.json')
    if os.path.exists(p):
        with open(p, 'r') as f: return json.load(f)
    return {}
    
def load_config():
    """
    Load configuration from config.json.
    """
    p = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config', 'config.json')
    if os.path.exists(p):
        with open(p, 'r') as f: return json.load(f)
    return {}

def rerank():
    """
    Sets up a reranker that post-processes results from the hybrid retriever.
    Uses Cohere if a key is provided, otherwise falls back to a local Cross-Encoder.
    
    Returns:
        The ContextualCompressionRetriever that performs the reranking.
    """
    br = hybrid_search()
    ks = load_keys()
    cfg = load_config()
    
    tn = cfg.get("top_k_reranking", 5)
    ck = ks.get("COHERE_API_KEY", "")
    
    # Try using Cohere if credentials exist
    if ck and ck != "YOUR_COHERE_API_KEY_HERE":
        try:
            from langchain.retrievers.document_compressors import CohereRerank
            cp = CohereRerank(cohere_api_key=ck, model="rerank-english-v3.0", top_n=tn)
            return ContextualCompressionRetriever(base_compressor=cp, base_retriever=br)
        except Exception: 
            pass
            
    # Local fallback to MS-MARCO Cross-Encoder
    re_model = HuggingFaceCrossEncoder(model_name="cross-encoder/ms-marco-MiniLM-L-6-v2")
    cp = CrossEncoderReranker(model=re_model, top_n=tn)
    return ContextualCompressionRetriever(base_compressor=cp, base_retriever=br)
