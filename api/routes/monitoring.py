import os
import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from typing import List, Dict

router = APIRouter(prefix="/api")

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EVAL_FILE = os.path.join(PROJECT_ROOT, 'evaluation', 'eval_results.json')
LOGS_FILE = os.path.join(PROJECT_ROOT, 'logs', 'rag_logs.jsonl')
SOURCE_DOCS_DIR = os.path.join(PROJECT_ROOT, 'data', 'source_documents')

@router.get("/evaluation")
async def get_evaluation_results():
    """Returns the most recent RAGAS evaluation benchmark results."""
    if not os.path.exists(EVAL_FILE):
        return {
            "baseline": {"version": "Loading...", "metrics": {"faithfulness": 0, "answer_relevancy": 0, "context_precision": 0}},
            "improved": {"version": "Loading...", "metrics": {"faithfulness": 0, "answer_relevancy": 0, "context_precision": 0}}
        }
    
    with open(EVAL_FILE, 'r') as f:
        return json.load(f)

@router.get("/logs")
async def get_rag_logs(limit: int = 20):
    """Returns the most recent RAG pipeline observability logs."""
    if not os.path.exists(LOGS_FILE):
        return []
    
    logs = []
    with open(LOGS_FILE, 'r') as f:
        for line in f:
            if line.strip():
                logs.append(json.loads(line))
    
    # Return last 'limit' logs
    return logs[-limit:]

@router.get("/documents")
async def get_ingested_documents():
    """Returns a list of all successfully ingested and indexed documents."""
    doc_tracking_file = os.path.join(PROJECT_ROOT, 'data', 'documents.json')
    if not os.path.exists(doc_tracking_file):
        return []
    
    with open(doc_tracking_file, 'r') as f:
        return json.load(f)
