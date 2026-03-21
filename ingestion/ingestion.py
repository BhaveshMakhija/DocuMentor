import os
import uuid
import json
from typing import List
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

def load_config():
    p = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config', 'config.json')
    if os.path.exists(p):
        with open(p, 'r') as f: return json.load(f)
    return {"chunk_size": 500, "chunk_overlap": 100}

def load_document(file_path: str) -> List[Document]:
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf": return PyPDFLoader(file_path).load()
    elif ext in [".txt", ".md"]: return TextLoader(file_path, encoding='utf-8').load()
    raise ValueError(f"Unsupported format: {ext}")

def process_and_chunk(file_path: str, filename: str) -> List[Document]:
    cfg = load_config()
    docs = load_document(file_path)
    ts = RecursiveCharacterTextSplitter(chunk_size=cfg.get("chunk_size", 500), chunk_overlap=cfg.get("chunk_overlap", 100), add_start_index=True)
    chunks = ts.split_documents(docs)
    doc_id = str(uuid.uuid4())
    for i, c in enumerate(chunks):
        c.metadata.update({"doc_id": doc_id, "chunk_id": f"{doc_id}_{i}", "source": filename})
    return chunks
