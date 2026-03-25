import os
import json
import time
from typing import Dict, Optional

JOBS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data', 'jobs')

class JobManager:
    @staticmethod
    def _get_job_path(job_id: str) -> str:
        os.makedirs(JOBS_DIR, exist_ok=True)
        return os.path.join(JOBS_DIR, f"{job_id}.json")

    @classmethod
    def create_job(cls, job_id: str):
        job_data = {
            "job_id": job_id,
            "status": "running",
            "stage": "starting",
            "progress": 0,
            "message": "Initializing benchmark...",
            "created_at": time.time(),
            "updated_at": time.time(),
            "result": None
        }
        cls.update_job(job_id, **job_data)
        return job_data

    @classmethod
    def update_job(cls, job_id: str, **kwargs):
        path = cls._get_job_path(job_id)
        
        job_data = {}
        if os.path.exists(path):
            with open(path, 'r') as f:
                job_data = json.load(f)
        
        job_data.update(kwargs)
        job_data["updated_at"] = time.time()
        
        with open(path, 'w') as f:
            json.dump(job_data, f, indent=2)

    @classmethod
    def get_job(cls, job_id: str) -> Optional[Dict]:
        path = cls._get_job_path(job_id)
        if not os.path.exists(path):
            return None
        with open(path, 'r') as f:
            return json.load(f)

    @classmethod
    def list_jobs(cls):
        if not os.path.exists(JOBS_DIR):
            return []
        jobs = []
        for f in os.listdir(JOBS_DIR):
            if f.endswith('.json'):
                jobs.append(cls.get_job(f.replace('.json', '')))
        return sorted(jobs, key=lambda x: x['updated_at'], reverse=True)
