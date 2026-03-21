import os
import json
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from reranking.reranking import rerank

PROMPT_TEMPLATE = """You are DocuMentor, a helpful assistant with domain-specific knowledge. 
Answer the user's question based ONLY on the provided context below.
If the answer cannot be found in the context, explicitly say "I don't know".
Always cite your sources by referencing the [doc_id] provided in each chunk of context.

Context:
{context}

Question:
{question}

Answer with citations:"""

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

def format_docs(docs):
    formatted = []
    for doc in docs:
        doc_id = doc.metadata.get("doc_id", "Unknown")
        source = doc.metadata.get("source", "Unknown")
        content = doc.page_content
        formatted.append(f"[{doc_id}] (Source: {source}):\n{content}")
    return "\n\n".join(formatted)

def run_qa_chain(query: str):
    """
    Returns (answer_string, list_of_docs)
    Combines reranker logic into QA.
    """
    keys = load_keys()
    config = load_config()
    
    openai_key = keys.get("OPENAI_API_KEY", "")
    if not openai_key or openai_key == "YOUR_OPENAI_API_KEY_HERE":
        raise ValueError("OPENAI_API_KEY is missing in config/keys.json")
        
    retriever = rerank()
    docs = retriever.invoke(query)
    
    if not docs:
        return "I don't know (no relevant documents found).", []
        
    context_str = format_docs(docs)
    prompt_input = {"context": context_str, "question": query}
    
    llm = ChatOpenAI(
        model=config.get("llm_model", "gpt-3.5-turbo"), 
        temperature=0, 
        openai_api_key=openai_key
    )
    prompt = PromptTemplate.from_template(PROMPT_TEMPLATE)
    chain = prompt | llm | StrOutputParser()
    
    answer = chain.invoke(prompt_input)
    return answer, docs
