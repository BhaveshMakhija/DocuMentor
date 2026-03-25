import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'mentor.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Documents table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        upload_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Evaluations table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS evaluations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id TEXT,
        faithfulness REAL,
        answer_relevancy REAL,
        context_precision REAL,
        config TEXT, -- JSON string
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents (id)
    )
    ''')
    
    # Metrics table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latency REAL,
        tokens INTEGER,
        cost REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()

def save_document(doc_id, filename):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT OR REPLACE INTO documents (id, filename) VALUES (?, ?)', (doc_id, filename))
    conn.commit()
    conn.close()

def save_evaluation(doc_id, metrics, config):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO evaluations (document_id, faithfulness, answer_relevancy, context_precision, config)
    VALUES (?, ?, ?, ?, ?)
    ''', (
        doc_id, 
        metrics.get('faithfulness', 0), 
        metrics.get('answer_relevancy', 0), 
        metrics.get('context_precision', 0), 
        json.dumps(config)
    ))
    conn.commit()
    conn.close()

def save_metrics(latency, tokens, cost):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO metrics (latency, tokens, cost) VALUES (?, ?, ?)', (latency, tokens, cost))
    conn.commit()
    conn.close()

def get_metrics_summary():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) as total_queries, AVG(latency) as avg_latency, AVG(cost) as avg_cost FROM metrics')
    row = cursor.fetchone()
    
    # p50/p95 latency
    cursor.execute('SELECT latency FROM metrics ORDER BY latency')
    latencies = [r['latency'] for r in cursor.fetchall()]
    
    p50 = latencies[int(len(latencies) * 0.5)] if latencies else 0
    p95 = latencies[int(len(latencies) * 0.95)] if latencies else 0
    
    conn.close()
    return {
        "total_queries": row['total_queries'],
        "avg_latency": row['avg_latency'],
        "avg_cost": row['avg_cost'],
        "p50_latency": p50,
        "p95_latency": p95
    }

def get_evaluation_history():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM evaluations ORDER BY timestamp DESC')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

if __name__ == "__main__":
    init_db()
