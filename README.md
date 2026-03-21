# DocuMentor

A lightweight, local, full-stack Retrieval-Augmented Generation (RAG) system for domain-specific documents.

## Project Structure
```text
DocuMentor/
├── backend/          # FastAPI backend and core RAG logic hooks
├── frontend/         # React application for user interactions
├── ingestion/        # Parsing logic for PDFs, TXT, MD
├── indexing/         # Vector (FAISS) and BM25 indexing scripts
├── retrieval/        # Hybrid search functionality (Vector + Keyword)
├── reranking/        # Cross-encoder re-ranking for accuracy
├── generation/       # Prompts and LLM connection hooks
├── evaluation/       # Ragas evaluation logic
├── config/           # Configuration and ignored API keys (keys.json)
└── tests/            # Test suite placeholder
```

## Running Locally

Because DocuMentor is built prioritizing lightweight flexibility, you can run both services natively without Docker. **Ensure you populate `config/keys.json` with your real keys first.**

### Option A: Run Backend
1. `pip install -r backend/requirements.txt`
2. `uvicorn backend.main:app --reload`
*Swagger test docs are loaded natively on http://localhost:8000/docs*

### Option B: Run Frontend
1. Open up an adjacent terminal. 
2. `cd frontend`
3. `npm install`
4. `npm start`
*This loads the intuitive React application locally connected bound to Backend endpoints automatically.*
