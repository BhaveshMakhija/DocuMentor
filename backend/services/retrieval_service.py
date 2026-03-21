import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from retrieval.retrieval import hybrid_search

def retrieve_documents(query: str):
    retriever = hybrid_search()
    return retriever.invoke(query)
    
def get_hybrid_retriever():
    return hybrid_search()
