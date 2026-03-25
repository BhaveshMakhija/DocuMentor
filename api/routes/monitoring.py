import os
import json
import uuid
import time
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from typing import List, Dict, Optional
from api.core.rag_logging.job_manager import JobManager

router = APIRouter(prefix="/api")

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LOGS_FILE = os.path.join(PROJECT_ROOT, 'logs', 'rag_logs.jsonl')
SOURCE_DOCS_DIR = os.path.join(PROJECT_ROOT, 'data', 'source_documents')

@router.get("/evaluation")
@router.get("/eval-history")
async def get_evaluation_results():
    """Returns the most recent RAGAS evaluation benchmark results from SQLite."""
    from database.db import get_evaluation_history
    try:
        history = get_evaluation_history()
        if not history: return None
        latest_doc = history[0]['document_id']
        doc_history = [h for h in history if h['document_id'] == latest_doc]
        baseline = None
        improved = None
        for h in doc_history:
            try:
                config = json.loads(h['config'])
            except: continue
            if config.get('enable_reranking') is False and not baseline:
                baseline = {"metrics": {"faithfulness": round(float(h['faithfulness']), 4), "answer_relevancy": round(float(h['answer_relevancy']), 4), "context_precision": round(float(h['context_precision']), 4)}, "timestamp": h['timestamp']}
            if config.get('enable_reranking') is True and not improved:
                improved = {"metrics": {"faithfulness": round(float(h['faithfulness']), 4), "answer_relevancy": round(float(h['answer_relevancy']), 4), "context_precision": round(float(h['context_precision']), 4)}, "timestamp": h['timestamp']}
            if baseline and improved: break
        return {"document_id": latest_doc, "baseline": baseline, "improved": improved}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def background_benchmark(doc_id: str, job_id: str):
    """Worker function for background benchmarking."""
    from evaluation.evaluator import RAGEvaluator
    try:
        evaluator = RAGEvaluator()
        evaluator.compare_pipelines(doc_id, job_id=job_id)
    except Exception as e:
        JobManager.update_job(job_id, status="failed", message=f"Worker Error: {str(e)}")

@router.post("/start-benchmark")
async def start_benchmark(background_tasks: BackgroundTasks, doc_id: str = None):
    """Starts a benchmark job in the background and returns a persistent job_id."""
    from database.db import get_db_connection
    
    if not doc_id:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM documents ORDER BY upload_timestamp DESC LIMIT 1')
        row = cursor.fetchone()
        conn.close()
        if not row: raise HTTPException(status_code=404, detail="No documents found.")
        doc_id = row['id']

    job_id = str(uuid.uuid4())
    JobManager.create_job(job_id)
    background_tasks.add_task(background_benchmark, doc_id, job_id)
    return {"job_id": job_id}

@router.get("/benchmark-status/{job_id}")
async def get_benchmark_status(job_id: str):
    """Returns the live state of a benchmark job."""
    job = JobManager.get_job(job_id)
    if not job: raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.get("/metrics")
async def get_system_metrics():
    from database.db import get_metrics_summary
    try: return get_metrics_summary()
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs")
async def get_rag_logs(limit: int = 50):
    if not os.path.exists(LOGS_FILE): return []
    logs = []
    with open(LOGS_FILE, 'r') as f:
        for line in f:
            if line.strip(): logs.append(json.loads(line))
    return logs[::-1][:limit]

@router.get("/documents")
async def get_ingested_documents():
    doc_tracking_file = os.path.join(PROJECT_ROOT, 'data', 'documents.json')
    if not os.path.exists(doc_tracking_file): return []
    with open(doc_tracking_file, 'r') as f: return json.load(f)

@router.delete("/documents/{filename}")
async def delete_document(filename: str):
    try:
        from database.db import get_db_connection
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM evaluations WHERE document_id IN (SELECT id FROM documents WHERE filename = ?)", (filename,))
        cursor.execute("DELETE FROM documents WHERE filename = ?", (filename,))
        conn.commit()
        conn.close()
    except: pass
    doc_tracking_file = os.path.join(PROJECT_ROOT, 'data', 'documents.json')
    if os.path.exists(doc_tracking_file):
        with open(doc_tracking_file, 'r') as f: docs = json.load(f)
        docs = [d for d in docs if d.get("filename") != filename]
        with open(doc_tracking_file, 'w') as f: json.dump(docs, f, indent=4)
    file_path = os.path.join(SOURCE_DOCS_DIR, filename)
    if os.path.exists(file_path): os.remove(file_path)
    return {"status": "success"}

@router.delete("/history")
async def clear_history():
    try:
        from database.db import get_db_connection
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM evaluations")
        cursor.execute("DELETE FROM metrics")
        conn.commit()
        conn.close()
        results_dir = os.path.join(PROJECT_ROOT, 'evaluation', 'results')
        if os.path.exists(results_dir):
            for f in os.listdir(results_dir): os.remove(os.path.join(results_dir, f))
        if os.path.exists(LOGS_FILE): os.remove(LOGS_FILE)
        # Also clear jobs
        jobs_dir = os.path.join(PROJECT_ROOT, 'data', 'jobs')
        if os.path.exists(jobs_dir):
            for f in os.listdir(jobs_dir): os.remove(os.path.join(jobs_dir, f))
        return {"status": "success"}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))
