from fastapi import APIRouter, UploadFile, File

router = APIRouter()

@router.post("/ingest")
async def ingest_document(file: UploadFile = File(...)):
    """
    Endpoint to ingest a new PDF or Text document locally.
    1. Save file to disk temporarily using backend/utils/file_utils.py.
    2. Read and parse text chunks (ingestion).
    3. Push chunks to Vector and BM25 local indices (indexing).
    """
    return {"status": "success", "message": f"Placeholder: ingested {file.filename}"}
