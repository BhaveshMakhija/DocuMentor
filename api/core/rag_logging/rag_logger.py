import os
import json
import time
from typing import List, Dict

LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'logs')
LOG_FILE = os.path.join(LOG_DIR, 'rag_logs.jsonl')

def log_query(query: str, retrieved_docs: List[str], answer: str, latency_ms: float):
    """
    Logs the RAG query details in a structured JSONL format for observability.
    
    Args:
        query: The user's query string.
        retrieved_docs: A list of the top-k retrieved document snippets.
        answer: The final LLM-generated answer.
        latency_ms: The total end-to-end latency in milliseconds.
    """
    if not os.path.exists(LOG_DIR):
        os.makedirs(LOG_DIR)
        
    log_entry = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "query": query,
        "retrieved_docs": retrieved_docs,
        "answer": answer,
        "latency_ms": latency_ms
    }
    
    with open(LOG_FILE, 'a') as f:
        f.write(json.dumps(log_entry) + '\n')

def log_event(event_type: str, level: str, message: str, metadata: Dict = None):
    """
    Logs a general system event for the observability dashboard.
    """
    if not os.path.exists(LOG_DIR):
        os.makedirs(LOG_DIR)
        
    log_entry = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "event_type": event_type,
        "level": level,
        "message": message,
        "metadata": metadata or {}
    }
    
    with open(LOG_FILE, 'a') as f:
        f.write(json.dumps(log_entry) + '\n')
