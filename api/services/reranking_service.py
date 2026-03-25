import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from api.core import rerank


def rerank_documents(query: str):
    retriever = rerank()
    return retriever.invoke(query)
