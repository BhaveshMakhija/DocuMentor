import os
import json
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder
from retrieval.retrieval import hybrid_search

def load_keys():
    p = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config', 'keys.json')
    if os.path.exists(p):
        with open(p, 'r') as f: return json.load(f)
    return {}
    
def load_config():
    p = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config', 'config.json')
    if os.path.exists(p):
        with open(p, 'r') as f: return json.load(f)
    return {}

def rerank():
    br = hybrid_search(); ks = load_keys(); cfg = load_config()
    tn = cfg.get("top_k_reranking", 5); ck = ks.get("COHERE_API_KEY", "")
    if ck and ck != "YOUR_COHERE_API_KEY_HERE":
        try:
            from langchain.retrievers.document_compressors import CohereRerank
            cp = CohereRerank(cohere_api_key=ck, model="rerank-english-v3.0", top_n=tn)
            return ContextualCompressionRetriever(base_compressor=cp, base_retriever=br)
        except Exception: pass
    cp = CrossEncoderReranker(model=HuggingFaceCrossEncoder(model_name="cross-encoder/ms-marco-MiniLM-L-6-v2"), top_n=tn)
    return ContextualCompressionRetriever(base_compressor=cp, base_retriever=br)
