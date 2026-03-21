from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
import os

from routes import query, ingest, health

# 1. Initialize FastAPI app
app = FastAPI(title="DocuMentor API", version="1.0.0")

# 2. Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Include Routers
app.include_router(health.router)
app.include_router(query.router)
app.include_router(ingest.router)

# 4. Load keys locally (No hardcoding)
KEYS_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config', 'keys.json')
CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config', 'config.json')

def load_config():
    # Helper to load JSON config cleanly
    pass

if __name__ == "__main__":
    # Start the local uvicorn server
    # Usage: python backend/main.py OR uvicorn backend.main:app --reload
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
