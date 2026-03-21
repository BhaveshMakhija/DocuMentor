import os
import uuid
from typing import List
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import json

def load_config():
    config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config', 'config.json')
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            return json.load(f)
    return {"chunk_size": 500, "chunk_overlap": 100}

def load_document(file_path: str) -> List[Document]:
    ext = os.path.splitext(file_path)[1].lower()
    
    docs = []
    if ext == ".pdf":
        loader = PyPDFLoader(file_path)
        docs = loader.load()
    elif ext in [".txt", ".md"]:
        loader = TextLoader(file_path, encoding='utf-8')
        docs = loader.load()
    else:
        raise ValueError(f"Unsupported file format: {ext}")
        
    return docs

def process_and_chunk(file_path: str, filename: str) -> List[Document]:
    config = load_config()
    docs = load_document(file_path)
    
    # Text splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=config.get("chunk_size", 500),
        chunk_overlap=config.get("chunk_overlap", 100),
        add_start_index=True,
    )
    
    chunks = text_splitter.split_documents(docs)
    
    # Add metadata
    doc_id = str(uuid.uuid4())
    for i, chunk in enumerate(chunks):
        chunk.metadata["doc_id"] = doc_id
        chunk.metadata["chunk_id"] = f"{doc_id}_{i}"
        chunk.metadata["source"] = filename
        
    return chunks
