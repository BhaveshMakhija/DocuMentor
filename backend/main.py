# DocuMentor Backend Main - Triggering Reload
import sys
import os
import json

# Absolute project root determination
CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CUR_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)
if CUR_DIR not in sys.path:
    sys.path.append(CUR_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from backend.routes import health, query, ingest

app = FastAPI(title="DocuMentor API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach Routers
app.include_router(health.router)
app.include_router(query.router)
app.include_router(ingest.router)

if __name__ == "__main__":
    # Standard run command: python backend/main.py
    # From root: python -m uvicorn backend.main:app --reload
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
