import os
import json
from langchain_community.retrievers import ElasticSearchBM25Retriever
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from typing import List
from elasticsearch import Elasticsearch

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

def get_embeddings():
    cfg = load_config()
    from langchain_community.embeddings import HuggingFaceEmbeddings
    return HuggingFaceEmbeddings(model_name=cfg.get("embedding_model", "sentence-transformers/all-MiniLM-L6-v2"))

class ElasticsearchBM25:
    def __init__(self):
        self.url = os.environ.get("ELASTICSEARCH_URL", "http://localhost:9200")
        self.index_name = "documentor_bm25"
        try:
            self.client = Elasticsearch(self.url)
            if self.client.ping():
                self.retriever = ElasticSearchBM25Retriever(client=self.client, index_name=self.index_name)
            else:
                self.client = None; self.retriever = None
        except Exception:
            self.client = None; self.retriever = None

    def add_documents(self, documents: List[Document]):
        if not self.retriever or not documents: return
        ts = [d.page_content for d in documents]
        # In current LangChain versions, ElasticSearchBM25Retriever.add_texts does not support metadata directly.
        # We index the texts; for richer metadata support, we'd use ElasticsearchStore.
        try:
            self.retriever.add_texts(ts)
        except Exception as e:
            print(f"Elasticsearch indexing failed: {str(e)}")

    def as_retriever(self, top_k: int = 10):
        if not self.retriever: return None
        return self.retriever

class FaissVectorStore:
    def __init__(self):
        self.path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'faiss_index')
        self.embs = get_embeddings()
    def add_documents(self, documents: List[Document]):
        if not documents: return
        if os.path.exists(self.path):
            vs = FAISS.load_local(self.path, self.embs, allow_dangerous_deserialization=True)
            vs.add_documents(documents)
        else: vs = FAISS.from_documents(documents, self.embs)
        os.makedirs(os.path.dirname(self.path), exist_ok=True); vs.save_local(self.path)
    def as_retriever(self, top_k: int = 10):
        if not os.path.exists(self.path): return None
        vs = FAISS.load_local(self.path, self.embs, allow_dangerous_deserialization=True)
        return vs.as_retriever(search_kwargs={"k": top_k})

def index_documents(chunks: list):
    ElasticsearchBM25().add_documents(chunks)
    FaissVectorStore().add_documents(chunks)
