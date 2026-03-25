import os
import json
from typing import List

def get_root():
    return os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

def load_keys():
    p = os.path.join(get_root(), 'config', 'keys.json')
    if os.path.exists(p):
        with open(p, 'r') as f: return json.load(f)
    return {}

def load_config():
    p = os.path.join(get_root(), 'config', 'config.json')
    if os.path.exists(p):
        with open(p, 'r') as f: return json.load(f)
    return {}

def get_embeddings():
    cfg = load_config()
    from langchain_community.embeddings import HuggingFaceEmbeddings
    return HuggingFaceEmbeddings(model_name=cfg.get("embedding_model", "sentence-transformers/all-MiniLM-L6-v2"))

class ElasticsearchBM25:
    def __init__(self):
        self.url = os.environ.get("ELASTICSEARCH_URL", "http://localhost:9200")
        self.index_name = "documentor_bm25"
        self.client = None
        self.retriever = None
        try:
            from elasticsearch import Elasticsearch
            from langchain_community.retrievers import ElasticSearchBM25Retriever
            self.client = Elasticsearch(self.url)
            if self.client.ping():
                self.retriever = ElasticSearchBM25Retriever(
                    client=self.client, index_name=self.index_name
                )
        except Exception:
            pass  # Elasticsearch is optional; FAISS-only mode will be used

    def add_documents(self, documents):
        if not self.retriever or not documents:
            return
        texts = [d.page_content for d in documents]
        try:
            self.retriever.add_texts(texts)
        except Exception as e:
            print(f"Elasticsearch indexing failed: {e}")

    def as_retriever(self, top_k: int = 10):
        return self.retriever  # May be None — caller checks

class FaissVectorStore:
    def __init__(self):
        self.path = os.path.join(get_root(), 'data', 'faiss_index')
        self.embs = get_embeddings()

    def add_documents(self, documents):
        if not documents:
            return
        from langchain_community.vectorstores import FAISS
        from langchain_core.documents import Document
        if os.path.exists(self.path):
            vs = FAISS.load_local(self.path, self.embs, allow_dangerous_deserialization=True)
            vs.add_documents(documents)
        else:
            vs = FAISS.from_documents(documents, self.embs)
        os.makedirs(os.path.dirname(self.path), exist_ok=True)
        vs.save_local(self.path)

    def as_retriever(self, top_k: int = 10):
        if not os.path.exists(self.path):
            return None
        from langchain_community.vectorstores import FAISS
        vs = FAISS.load_local(self.path, self.embs, allow_dangerous_deserialization=True)
        return vs.as_retriever(search_kwargs={"k": top_k})

def index_documents(chunks: list):
    ElasticsearchBM25().add_documents(chunks)
    FaissVectorStore().add_documents(chunks)
