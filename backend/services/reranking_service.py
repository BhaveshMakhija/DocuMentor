import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from reranking.reranking import rerank

def rerank_documents(query: str):
    retriever = rerank()
    return retriever.invoke(query)
