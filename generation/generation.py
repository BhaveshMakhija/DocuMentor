import os
import json
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
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
    ks = load_keys(); cfg = {"llm_model": "gpt-3.5-turbo"}
    ok = ks.get("OPENAI_API_KEY", "")
    if not ok or ok == "YOUR_OPENAI_API_KEY_HERE": raise ValueError("OpenAI Key Missing")
    docs = rerank().invoke(query)
    if not docs: return "No details found.", []
    ctx = "\n\n".join([f"[{d.metadata.get('doc_id')}] (Source: {d.metadata.get('source')}):\n{d.page_content}" for d in docs])
    llm = ChatOpenAI(model=cfg["llm_model"], temperature=0, openai_api_key=ok)
    p = PromptTemplate.from_template(PROMPT_TEMPLATE)
    chain = p | llm | StrOutputParser()
    return chain.invoke({"context": ctx, "question": query}), docs
