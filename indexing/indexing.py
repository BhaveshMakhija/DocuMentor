import os
import json
from langchain_community.retrievers import ElasticSearchBM25Retriever
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from typing import List
from elasticsearch import Elasticsearch

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

def get_embeddings():
    keys = load_keys()
    config = load_config()
    
    # Check if OPENAI is provided, otherwise fallback to local HuggingFace
    from langchain_community.embeddings import HuggingFaceEmbeddings
    if keys.get("OPENAI_API_KEY") and not config.get("use_local_embeddings", False):
        try:
            from langchain_openai import OpenAIEmbeddings
            return OpenAIEmbeddings(api_key=keys.get("OPENAI_API_KEY"))
        except ImportError:
            pass
            
    return HuggingFaceEmbeddings(model_name=config.get("embedding_model", "sentence-transformers/all-MiniLM-L6-v2"))

class ElasticsearchBM25:
    def __init__(self):
        self.url = os.environ.get("ELASTICSEARCH_URL", "http://localhost:9200")
        self.index_name = "documentor_bm25"
        self.client = Elasticsearch(self.url)
        self.retriever = ElasticSearchBM25Retriever(
            client=self.client,
            index_name=self.index_name,
        )
    
    def add_documents(self, documents: List[Document]):
        texts = [doc.page_content for doc in documents]
        metadatas = [doc.metadata for doc in documents]
        if texts:
            self.retriever.add_texts(texts, metadatas=metadatas)
        
    def as_retriever(self, top_k: int = 10):
        return ElasticSearchBM25Retriever(client=self.client, index_name=self.index_name)

class FaissVectorStore:
    def __init__(self):
        self.path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'faiss_index')
        self.embeddings = get_embeddings()
        
    def add_documents(self, documents: List[Document]):
        if not documents:
            return
            
        if os.path.exists(self.path):
            vector_store = FAISS.load_local(
                folder_path=self.path,
                embeddings=self.embeddings,
                allow_dangerous_deserialization=True
            )
            vector_store.add_documents(documents)
        else:
            vector_store = FAISS.from_documents(documents, self.embeddings)
            os.makedirs(os.path.dirname(self.path), exist_ok=True)
            
        vector_store.save_local(self.path)
        
    def as_retriever(self, top_k: int = 10):
        if not os.path.exists(self.path):
            return None
            
        vector_store = FAISS.load_local(
            folder_path=self.path,
            embeddings=self.embeddings,
            allow_dangerous_deserialization=True
        )
        return vector_store.as_retriever(search_kwargs={"k": top_k})

def index_documents(chunks: list):
    """
    Inserts chunks into local BM25 (Elasticsearch) and Vector (FAISS).
    """
    bm25 = ElasticsearchBM25()
    vector = FaissVectorStore()
    
    bm25.add_documents(chunks)
    vector.add_documents(chunks)
