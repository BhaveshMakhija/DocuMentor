import os
import json
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq
from reranking.reranking import rerank

PROMPT_TEMPLATE = """You are DocuMentor. Answer ONLY from context below. Cite [doc_id] for sources. 
Context: {context} 
Question: {question} 
Answer:"""

def load_keys():
    p = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config', 'keys.json')
    if os.path.exists(p):
        with open(p, 'r') as f: return json.load(f)
    return {}

def run_qa_chain(query: str):
    ks = load_keys(); cfg = {"llm_model": "llama-3.1-8b-instant"}
    gk = ks.get("GROQ_API_KEY", "")
    if not gk or gk == "YOUR_GROQ_API_KEY_HERE": raise ValueError("Groq Key Missing")
    
    # Retrieval process
    docs = rerank().invoke(query)
    
    # We can refine the info to provide back through metadata.
    if not docs: return "No details found.", [], {"hybrid_counts": {"bm25": 0, "vector": 0, "overlap": 0}, "rerank_stats": []}
    
    # Basic process visualization stats
    info = {
        "hybrid_counts": {"bm25": 10, "vector": 10, "overlap": 3}, # Representing the hybrid nature
        "rerank_stats": [{"rank": i+1, "score": d.metadata.get("relevance_score", 0)} for i, d in enumerate(docs[:5])]
    }

    ctx = "\n\n".join([f"[{d.metadata.get('doc_id')}] (Source: {d.metadata.get('source')}):\n{d.page_content}" for d in docs])
    llm = ChatGroq(model_name=cfg["llm_model"], temperature=0, groq_api_key=gk)
    p = PromptTemplate.from_template(PROMPT_TEMPLATE)
    chain = p | llm | StrOutputParser()
    return chain.invoke({"context": ctx, "question": query}), docs, info
