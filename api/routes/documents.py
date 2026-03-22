from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SOURCE_DOCS_DIR = os.path.join(PROJECT_ROOT, 'data', 'source_documents')

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.get("/serve/{filename}")
async def serve_document(filename: str):
    file_path = os.path.join(SOURCE_DOCS_DIR, filename)
    
    if not os.path.exists(file_path):
        # Check if the filename might be slightly different or need decoding
        # But encodeURIComponent should handle spaces etc.
        raise HTTPException(status_code=404, detail=f"Document {filename} not found at {file_path}")
        
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type='application/pdf' if filename.lower().endswith('.pdf') else 'text/plain'
    )
