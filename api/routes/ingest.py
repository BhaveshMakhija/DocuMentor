from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import sys
import json
import time
import shutil

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path: 
    sys.path.append(PROJECT_ROOT)

from api.utils.file_utils import save_temp_file
from api.core import process_and_chunk, index_documents


router = APIRouter()

import traceback

DOC_TRACKING_FILE = os.path.join(PROJECT_ROOT, 'data', 'documents.json')
SOURCE_DOCS_DIR = os.path.join(PROJECT_ROOT, 'data', 'source_documents')

# Ensure the source documents directory exists
os.makedirs(SOURCE_DOCS_DIR, exist_ok=True)

def track_document(filename: str, num_chunks: int):
    """Update documents.json to persist document list after ingestion."""
    docs = []
    if os.path.exists(DOC_TRACKING_FILE):
        with open(DOC_TRACKING_FILE, 'r') as f:
            docs = json.load(f)
    
    docs.append({
        "filename": filename,
        "date_ingested": time.strftime("%Y-%m-%d %H:%M:%S"),
        "chunk_count": num_chunks
    })
    
    with open(DOC_TRACKING_FILE, 'w') as f:
        json.dump(docs, f, indent=4)

@router.post("/ingest")
@router.post("/upload-doc")
async def ingest_document(file: UploadFile = File(...)):
    if file.filename.split(".")[-1].lower() not in ["pdf", "txt", "md"]:
        raise HTTPException(status_code=400, detail="Only PDF, TXT, and MD supported.")
    try:
        from database.db import save_document
        from evaluation.generator import generate_dataset
        
        # 1. Save temp file and index it
        temp_path = save_temp_file(file)
        chunks = process_and_chunk(temp_path, file.filename)
        index_documents(chunks)
        
        # 2. Persist the file for later viewing ("Open Full")
        persistent_path = os.path.join(SOURCE_DOCS_DIR, file.filename)
        shutil.copy2(temp_path, persistent_path)
        
        # 3. Document ID (all chunks in this ingestion have the same doc_id)
        doc_id = chunks[0].metadata.get("doc_id") if chunks else "N/A"
        
        # 4. Store in SQLite
        save_document(doc_id, file.filename)
        
        # 5. Trigger Dataset Generation (Wait or async)
        # For now, let's do it synchronously as per prompt request "trigger dataset generation"
        # In production, this would be a background task (e.g. celery/fastapi-background-tasks)
        dataset_path = generate_dataset(chunks, doc_id)
        
        # 6. Persistent tracking for the UI (original JSON method for consistency)
        track_document(file.filename, len(chunks) if chunks else 0)
        
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return {
            "status": "success", 
            "message": f"Ingested {file.filename}", 
            "doc_id": doc_id,
            "num_chunks": len(chunks) if chunks else 0,
            "dataset_path": dataset_path
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

