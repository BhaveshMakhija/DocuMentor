from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path: sys.path.append(PROJECT_ROOT)

from backend.utils.file_utils import save_temp_file
from ingestion.ingestion import process_and_chunk
from indexing.indexing import index_documents

router = APIRouter()

@router.post("/ingest")
async def ingest_document(file: UploadFile = File(...)):
    if file.filename.split(".")[-1].lower() not in ["pdf", "txt", "md"]:
        raise HTTPException(status_code=400, detail="Only PDF, TXT, and MD supported.")
    try:
        temp_path = save_temp_file(file)
        chunks = process_and_chunk(temp_path, file.filename)
        index_documents(chunks)
        os.remove(temp_path)
        return {"status": "success", "message": f"Ingested {file.filename}", "num_chunks": len(chunks)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
